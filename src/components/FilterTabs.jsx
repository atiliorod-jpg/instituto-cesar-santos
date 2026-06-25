export default function FilterTabs({ opcoes, ativo, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {opcoes.map((op) => (
        <button
          key={op.value}
          onClick={() => onChange(op.value)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border ${
            ativo === op.value
              ? 'bg-ics-preto text-white border-ics-preto'
              : 'bg-white text-ics-cinza border-black/10'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
