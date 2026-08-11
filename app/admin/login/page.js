import AdminLoginForm from "../../../components/auth/AdminLoginForm";

export const metadata = {
  title: "Admin Login — Mossad",
};

export default function AdminLoginPage() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20 min-h-[70vh]">
      <AdminLoginForm />
    </section>
  );
}