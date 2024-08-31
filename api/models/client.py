class Client():
    def __init__(self,row):
        self.id = row[0]
        self.nombre = row[1]
        self.telefono = row[2]
        self.email = row[3]
        self.super = row[4]

    def to_json(self):
        return {
            "id":self.id,
            "nombre":self.nombre,
            "telefono":self.telefono,
            "email":self.email,
            "super":self.super,
        }
        