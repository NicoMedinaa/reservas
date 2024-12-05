class Rubro():
    def __init__(self,row):
        self.id = row[0]
        self.nombre = row[1]
        self.importe = row[2]
        self.comprobante = row[3]
        self.descripcion = row[4]

    def to_json(self):
        return {
            "id":self.id,
            "nombre":self.nombre,
            "importe":self.importe,
            "comprobante":self.comprobante,
            "descripcion":self.descripcion,
        }