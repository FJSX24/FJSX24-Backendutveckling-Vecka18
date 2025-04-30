import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();

// Anslutningsinställningar till PostgreSQL
// new Pool() skapar en ny instans av Pool-objektet. Pool-objektet används för att hantera flera anslutningar till databasen.
// Vi kan använda en pool för att hantera flera anslutningar till databasen. Det är mer effektivt än att skapa en ny anslutning varje gång vi vill göra en databasfråga.
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "testdb",
  password: "degerfors85",
  port: 5432,
});
// Vi använder async/await för att hantera asynkrona operationer. Det gör koden mer läsbar och lättare att förstå.
// Vi använder try/catch för att fånga eventuella fel som kan uppstå när vi försöker ansluta till databasen.
// Om det uppstår ett fel, kommer vi att logga det till konsolen.
(async () => {
  try {
    await pool.connect();
    console.log("Ansluten till databasen");
  } catch (err) {
    console.error("Kunde inte ansluta till databasen", err);
  }
})();
// pool.end(): Stänger ner alla anslutningar i poolen.
// Vi behöver inte stänga ner poolen i det här exemplet eftersom vi kommer att använda den under hela programmets livslängd.

// "Varför använder vi Pool?
// Det gör vår app snabbare eftersom vi slipper öppna nya anslutningar till databasen varje gång."
// "Vad är skillnaden mellan Pool och Client?
// Pool är en samling av anslutningar som kan återanvändas, medan Client är en enskild anslutning."

app.use(express.json());

// GET – hämta alla användare
app.get("/users", async (req, res) => {
  try {
    // Metoden pool.query() används för att utföra SQL-frågor mot databasen.

    // Den tar en SQL-fråga som en sträng och en array med värden som ska ersätta eventuella placeholders i frågan.
    // I det här fallet hämtar vi alla användare från tabellen "users".
    // pool.query('SQL', [värden]);
    // "Hur fungerar pool.query()?
    // Vi skickar en SQL-query och eventuella värden till databasen och får tillbaka ett resultat i JavaScript-objekt."
    // "Vad är skillnaden mellan pool.query() och client.query()?
    // pool.query() används för att utföra frågor mot en pool av anslutningar, medan client.query() används för att utföra frågor mot en enskild anslutning."
    // "Vad är skillnaden mellan rows och result?
    // rows är en array med resultaten från frågan, medan result är ett objekt som innehåller metadata om frågan, inklusive rows."

    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – skapa ny användare
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      // $1, $2 är placeholders för att förhindra SQL-injection. RETURNING * gör att det nya objektet returneras.
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Servern kör på port 3000");
});
