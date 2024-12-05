class Documento():
    def __init__(self,row):
        self.id = row[0]
        self.numero = row[1]
        self.enUso = row[2]

    def to_json(self):
        return {
            "id":self.id,
            "numero":self.numero,
            "enUso":self.enUso,
        }