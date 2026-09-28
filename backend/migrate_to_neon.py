import sqlite3
import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, inspect, text

sqlite_path = os.path.join(os.path.dirname(__file__), 'interior.db')
sqlite_conn = sqlite3.connect(sqlite_path)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

neon_url = os.getenv("DATABASE_URL")
if not neon_url:
    neon_url = "postgresql://neondb_owner:npg_NIk2dKUDTX7R@ep-flat-credit-b4ehl9tu-pooler.c-6.us-east-2.aws.neon.tech/moreint?sslmode=require"

print("Connecting to Neon Postgres...")
neon_engine = create_engine(neon_url, echo=False)
inspector = inspect(neon_engine)

tables_in_order = [
    'tenants',
    'users',
    'clients',
    'projects',
    'rooms',
    'materials',
    'measurements',
    'boq_items',
    'quotations',
    'quotation_items',
    'follow_ups',
    'client_responses',
    'whatsapp_logs'
]

def parse_val(col_name, val, pg_type):
    if val is None:
        return None
    type_str = str(pg_type).upper()
    if 'BOOL' in type_str:
        return bool(val)
    if 'DATETIME' in type_str or 'TIMESTAMP' in type_str:
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val.replace('Z', '+00:00'))
            except Exception:
                try:
                    return datetime.strptime(val, "%Y-%m-%d %H:%M:%S.%f")
                except Exception:
                    try:
                        return datetime.strptime(val, "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        return val
    return val

total_migrated = 0

with neon_engine.begin() as pg_conn:
    # 1. Cleanly delete in reverse topological order (children first)
    print("Clearing Neon tables in reverse order for clean migration...")
    for t in reversed(tables_in_order):
        pg_conn.execute(text(f'DELETE FROM "{t}"'))

    # 2. Insert in forward topological order (parents first)
    for table in tables_in_order:
        sqlite_cur.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}';")
        if not sqlite_cur.fetchone():
            continue

        pg_cols = {c['name']: c['type'] for c in inspector.get_columns(table)}
        sqlite_cur.execute(f"SELECT * FROM {table};")
        rows = sqlite_cur.fetchall()
        print(f"Migrating {len(rows)} records for table '{table}'...")

        migrated_for_table = 0
        for row in rows:
            row_dict = dict(row)
            data = {}
            for col, val in row_dict.items():
                if col in pg_cols:
                    data[col] = parse_val(col, val, pg_cols[col])
            
            if 'tenant_id' in pg_cols and (data.get('tenant_id') is None):
                data['tenant_id'] = 'tenant-abc-interiors'

            # Ensure referenced client exists for projects
            if table == 'projects' and data.get('client_id'):
                c_exists = pg_conn.execute(text('SELECT 1 FROM clients WHERE id=:id'), {'id': data['client_id']}).fetchone()
                if not c_exists:
                    pg_conn.execute(
                        text('INSERT INTO clients (id, tenant_id, name, phone, city) VALUES (:id, :tenant_id, :name, :phone, :city) ON CONFLICT ("id") DO NOTHING'),
                        {'id': data['client_id'], 'tenant_id': data.get('tenant_id', 'tenant-abc-interiors'), 'name': 'Pooja Varma (Seawoods)', 'phone': '9876543210', 'city': 'Navi Mumbai'}
                    )

            cols_str = ', '.join([f'"{k}"' for k in data.keys()])
            placeholders = ', '.join([f':{k}' for k in data.keys()])
            update_str = ', '.join([f'"{k}" = EXCLUDED."{k}"' for k in data.keys() if k != 'id'])

            if 'id' in data:
                if update_str:
                    stmt = text(f'INSERT INTO "{table}" ({cols_str}) VALUES ({placeholders}) ON CONFLICT ("id") DO UPDATE SET {update_str}')
                else:
                    stmt = text(f'INSERT INTO "{table}" ({cols_str}) VALUES ({placeholders}) ON CONFLICT ("id") DO NOTHING')
            else:
                stmt = text(f'INSERT INTO "{table}" ({cols_str}) VALUES ({placeholders})')

            pg_conn.execute(stmt, data)
            migrated_for_table += 1
            total_migrated += 1

        print(f"  ✓ {table}: {migrated_for_table} records migrated.")

sqlite_conn.close()
print(f"\n==========================================")
print(f" ✅ Full Migration Success! Total rows: {total_migrated}")
print(f"==========================================")
