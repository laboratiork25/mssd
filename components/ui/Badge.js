const statusStyles = {
  nuova: "bg-ash/10 text-ash-light border-ash/30",
  in_revisione: "bg-blood/10 text-blood-light border-blood/40",
  confermata: "bg-bordeaux/20 text-fog border-bordeaux/50",
  respinta: "bg-carbone text-ash border-ash/20",
  chiusa: "bg-black text-ash-light border-ash/10",
};

const labels = {
  nuova: "Nuova",
  in_revisione: "In revisione",
  confermata: "Confermata",
  respinta: "Respinta",
  chiusa: "Chiusa",
};

export default function Badge({ status }) {
  const style = statusStyles[status] || statusStyles.nuova;
  const label = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-body border tracking-wide uppercase ${style}`}
    >
      {label}
    </span>
  );
}