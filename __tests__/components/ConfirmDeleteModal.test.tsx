import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: "¿Eliminar elemento?",
  message: "Esta acción no se puede deshacer.",
};

describe("ConfirmDeleteModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza correctamente cuando está abierto", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "¿Eliminar elemento?" })).toBeInTheDocument();
    expect(screen.getByText("Esta acción no se puede deshacer.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
  });

  it("no renderiza cuando isOpen es false", () => {
    render(<ConfirmDeleteModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("¿Eliminar elemento?")).not.toBeInTheDocument();
  });

  it("llama onConfirm cuando se hace clic en Eliminar", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama onClose cuando se hace clic en Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ConfirmDeleteModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("muestra texto de warning cuando se proporciona", () => {
    render(
      <ConfirmDeleteModal
        {...defaultProps}
        warningText="Este niño está en 2 fiestas activas."
      />
    );

    expect(screen.getByText("Este niño está en 2 fiestas activas.")).toBeInTheDocument();
  });

  it("usa botón danger por defecto", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    expect(deleteButton).toHaveClass("bg-red-500");
  });

  it("usa texto de confirmación personalizado", () => {
    render(
      <ConfirmDeleteModal {...defaultProps} confirmText="Cancelar Fiesta" />
    );

    expect(screen.getByRole("button", { name: /cancelar fiesta/i })).toBeInTheDocument();
  });

  it("muestra estado de carga durante onConfirm async", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);

    expect(screen.getByText("Eliminando...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    });
  });

  it("deshabilita botones durante carga", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
    });
  });

  it("tiene icono de alerta", () => {
    const { container } = render(<ConfirmDeleteModal {...defaultProps} />);

    const alertIcon = container.querySelector("svg");
    expect(alertIcon).toBeInTheDocument();
  });

  it("usa estilo danger con fondo rojo para el icono", () => {
    const { container } = render(<ConfirmDeleteModal {...defaultProps} dangerous={true} />);

    const iconContainer = container.querySelector(".bg-red-100");
    expect(iconContainer).toBeInTheDocument();
  });

  it("usa estilo naranja cuando dangerous es false", () => {
    const { container } = render(<ConfirmDeleteModal {...defaultProps} dangerous={false} />);

    const iconContainer = container.querySelector(".bg-orange-100");
    expect(iconContainer).toBeInTheDocument();
  });
});
