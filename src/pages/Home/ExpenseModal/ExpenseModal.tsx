import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import "./ExpenseModal.css";

export type ExpenseCategoryEnum =
  | "RENT"
  | "UTILITIES"
  | "SALARIES"
  | "TRANSPORT"
  | "MARKETING"
  | "TAXES"
  | "MAINTENANCE"
  | "OTHER";

export interface CreateExpensePayloadInterface {
  category: ExpenseCategoryEnum;
  amount: number;
  description?: string;
  occurredAt?: string;
}

interface ExpenseModalPropsInterface {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateExpensePayloadInterface) => void;
}

export const ExpenseModal: React.FC<ExpenseModalPropsInterface> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const getFormattedCurrentDateTime = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [category, setCategory] = useState<ExpenseCategoryEnum>("OTHER");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(
    getFormattedCurrentDateTime(),
  );
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CreateExpensePayloadInterface = {
      category,
      amount: parseFloat(amount),
      description: description.trim() !== "" ? description : undefined,
      occurredAt: occurredAt !== "" ? occurredAt : undefined,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="expense-modal-backdrop-overlay" onClick={onClose}>
      <div
        className="expense-modal-card-container"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="expense-modal-header-section">
          <h2 className="expense-modal-header-title">
            Registrar Gasto Operativo
          </h2>
          <button
            type="button"
            className="expense-modal-close-icon-button"
            onClick={onClose}
          >
            &times;
          </button>
        </header>

        <form className="expense-modal-form-body" onSubmit={handleSubmit}>
          {/* Categoría de Gasto */}
          <div className="expense-modal-form-field-group">
            <label
              htmlFor="expense-category-select"
              className="expense-modal-field-label"
            >
              Tipo de Gasto *
            </label>
            <select
              id="expense-category-select"
              required
              className="expense-modal-select-input"
              value={category}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setCategory(e.target.value as ExpenseCategoryEnum)
              }
            >
              <option value={"RENT"}>Alquiler</option>
              <option value={"UTILITIES"}>Servicios Públicos</option>
              <option value={"SALARIES"}>Sueldos</option>
              <option value={"TRANSPORT"}>Transporte</option>
              <option value={"MARKETING"}>Marketing</option>
              <option value={"TAXES"}>Impuestos</option>
              <option value={"MAINTENANCE"}>Mantenimiento</option>
              <option value={"OTHER"}>Otros</option>
            </select>
          </div>

          {/* Monto */}
          <div className="expense-modal-form-field-group">
            <label
              htmlFor="expense-amount-input"
              className="expense-modal-field-label"
            >
              Monto *
            </label>
            <input
              id="expense-amount-input"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="expense-modal-text-input"
              value={amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAmount(e.target.value)
              }
            />
          </div>

          {/* DateTime Picker Field */}
          <div className="expense-modal-form-field-group">
            <label
              htmlFor="expense-datetime-input"
              className="expense-modal-field-label"
            >
              Fecha y Hora de Ocurrencia (Opcional)
            </label>
            <input
              id="expense-datetime-input"
              type="datetime-local"
              className="expense-modal-datetime-input"
              value={occurredAt}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOccurredAt(e.target.value)
              }
            />
          </div>

          {/* Descripción */}
          <div className="expense-modal-form-field-group">
            <label
              htmlFor="expense-description-textarea"
              className="expense-modal-field-label"
            >
              Descripción / Detalle (Opcional)
            </label>
            <textarea
              id="expense-description-textarea"
              rows={3}
              placeholder="Ej. Pago del servicio de energía eléctrica del local"
              className="expense-modal-textarea-input"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />
          </div>

          {/* Botones de Acción */}
          <footer className="expense-modal-actions-footer">
            <button
              type="button"
              className="expense-modal-secondary-button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="expense-modal-primary-button">
              Registrar Gasto
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
