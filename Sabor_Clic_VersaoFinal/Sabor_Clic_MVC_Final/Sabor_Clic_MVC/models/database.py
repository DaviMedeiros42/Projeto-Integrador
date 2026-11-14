from flask import current_app
from mysql.connector import pooling
_pool = None
def get_connection():
    global _pool
    if _pool is None:
        c=current_app.config
        _pool=pooling.MySQLConnectionPool(pool_name="sabor_clic_pool",pool_size=5,
          host=c["MYSQL_HOST"],port=c["MYSQL_PORT"],user=c["MYSQL_USER"],
          password=c["MYSQL_PASSWORD"],database=c["MYSQL_DATABASE"],
          charset="utf8mb4",collation="utf8mb4_unicode_ci")
    return _pool.get_connection()
def query(sql,params=(),one=False,commit=False):
    conn=get_connection(); cur=conn.cursor(dictionary=True)
    try:
        cur.execute(sql,params)
        if commit: conn.commit(); return cur.lastrowid
        return cur.fetchone() if one else cur.fetchall()
    except Exception:
        conn.rollback(); raise
    finally: cur.close(); conn.close()
