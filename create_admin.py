"""Cria/atualiza um administrador com senha protegida. Execute: python create_admin.py"""
import getpass, os
import mysql.connector
from dotenv import load_dotenv
load_dotenv()
from werkzeug.security import generate_password_hash

conn=mysql.connector.connect(host=os.getenv('DB_HOST','localhost'),port=int(os.getenv('DB_PORT','3306')),user=os.getenv('DB_USER','root'),password=os.getenv('DB_PASSWORD',''),database=os.getenv('DB_NAME','sabor_clic'))
cur=conn.cursor()
nome=input('Nome do administrador: ').strip()
email=input('E-mail: ').strip().lower()
senha=getpass.getpass('Senha (mínimo 8 caracteres): ')
if len(senha)<8: raise SystemExit('A senha precisa ter pelo menos 8 caracteres.')
cur.execute('SELECT id_administrador FROM administrador WHERE email=%s',(email,))
row=cur.fetchone()
if row:
    cur.execute('UPDATE administrador SET nome=%s,password_hash=%s,ativo=1 WHERE id_administrador=%s',(nome,generate_password_hash(senha),row[0]))
else:
    cur.execute('INSERT INTO administrador (nome,email,password_hash) VALUES (%s,%s,%s)',(nome,email,generate_password_hash(senha)))
conn.commit(); cur.close(); conn.close()
print('Administrador pronto para fazer login.')
