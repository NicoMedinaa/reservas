class Turnos():
    def __init__(self,row):
        self.id = row[0]
        self.idUsuario = row[1]
        self.date = row[2]
        self.title = row[3]
        self.idCategoria = row[4]

    def to_json(self):
        return {
            "id":self.id,
            "idUsuario":self.idUsuario,
            "date":self.date,
            "title":self.title,
            "idCategoria":self.idCategoria,
        }
        