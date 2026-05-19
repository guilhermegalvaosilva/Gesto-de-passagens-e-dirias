export function FormSection({ number, title, accent, children }) {
  return (
    <section className={`form-section ${accent ? "accent-section" : ""}`}>
      <h3>
        <span>{number}</span>
        {title}
      </h3>
      <div className="form-grid">{children}</div>
    </section>
  );
}

export function Input({ label, name, value, setField, full, required, ...props }) {
  return (
    <div className={`form-group ${full ? "full" : ""}`}>
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        name={name}
        value={value || ""}
        onChange={(event) => setField(name, event.target.value)}
        required={required}
        {...props}
      />
    </div>
  );
}

export function TextArea({ label, name, value, setField, full, required }) {
  return (
    <div className={`form-group ${full ? "full" : ""}`}>
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={(event) => setField(name, event.target.value)}
        required={required}
      />
    </div>
  );
}

export function Select({ label, name, value, setField, options, required }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label} {required && <span className="required">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value || ""}
        onChange={(event) => setField(name, event.target.value)}
        required={required}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
