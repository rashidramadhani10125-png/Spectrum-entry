import { useCallback, useEffect, useState, type FormEvent } from "react";

interface Client {
  id: number;
  first_name: string;
  last_name: string;
  nrc: string;
  phone: string;
  email: string | null;
  created_at: string;
}

interface ClientForm {
  firstName: string;
  lastName: string;
  nrc: string;
  phone: string;
  email: string;
}

const emptyForm: ClientForm = {
  firstName: "",
  lastName: "",
  nrc: "",
  phone: "",
  email: "",
};

async function errorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json();
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
  ) {
    return body.message;
  }
  return "The request could not be completed.";
}

function App() {
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error(await errorMessage(response));
      }
      const records: Client[] = await response.json();
      setClients(records);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load registered clients.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  function updateField(field: keyof ClientForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function registerClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value.trim()]),
          ),
        ),
      });

      if (!response.ok) {
        throw new Error(await errorMessage(response));
      }

      setForm(emptyForm);
      setNotice("Client registered successfully.");
      await loadClients();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to register this client.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main>
      <h1>Register Client</h1>
      <form onSubmit={registerClient}>
        <label>
          First Name
          <input
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
        </label>
        <label>
          Last Name
          <input
            autoComplete="family-name"
            required
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </label>
        <label>
          NRC Number
          <input
            required
            value={form.nrc}
            onChange={(event) => updateField("nrc", event.target.value)}
          />
        </label>
        <label>
          Phone Number
          <input
            autoComplete="tel"
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>
        <label>
          Email (optional)
          <input
            autoComplete="email"
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
        <button disabled={saving}>
          {saving ? "Registering..." : "Register"}
        </button>
      </form>

      {error && <p role="alert">Error: {error}</p>}
      {notice && <p role="status">{notice}</p>}

      <h2>Registered Clients</h2>
      <button
        className="refresh-btn"
        disabled={loading}
        onClick={() => void loadClients()}
        type="button"
      >
        {loading ? "Loading..." : "Refresh List"}
      </button>

      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">NRC</th>
            <th scope="col">Phone</th>
            <th scope="col">Email</th>
            <th scope="col">Date Registered</th>
          </tr>
        </thead>
        <tbody id="clientsTable" className={loading ? "" : "show"}>
          {loading ? (
            <tr>
              <td colSpan={5}>Loading clients...</td>
            </tr>
          ) : clients.length === 0 ? (
            <tr>
              <td colSpan={5}>No clients registered yet.</td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id}>
                <td>
                  {client.first_name} {client.last_name}
                </td>
                <td>{client.nrc}</td>
                <td>{client.phone}</td>
                <td>{client.email || "N/A"}</td>
                <td>{new Date(client.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}

export default App;
