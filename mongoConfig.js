// create db: "premi" and collection: "users"

conn = new Mongo();

db = conn.getDB("premi");

db.users.insert({'prova' : 'prova'});

db.users.remove({});
