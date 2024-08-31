class CategoriaTurnos():
    def __init__(self,row):
        self.id = row[0]
        self.nombre = row[1]
        self.descripcion = row[2]
        self.precio = row[3]

    def to_json(self):
        return {
            "id":self.id,
            "nombre":self.nombre,
            "descripcion":self.descripcion,
            "precio":self.precio,
        }