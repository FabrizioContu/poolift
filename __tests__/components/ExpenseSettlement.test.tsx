import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseSettlement } from "@/app/calculator/ExpenseSettlement";

describe("ExpenseSettlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza 2 filas iniciales con placeholders", () => {
    render(<ExpenseSettlement />);
    expect(screen.getByPlaceholderText("Persona 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Persona 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Calcular liquidación/i })).toBeInTheDocument();
  });

  it("acepta initialParticipants y pre-llena los nombres", () => {
    render(<ExpenseSettlement initialParticipants={["Ana", "Luis", "Marta"]} />);
    expect(screen.getByDisplayValue("Ana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Luis")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Marta")).toBeInTheDocument();
  });

  it("muestra error si un monto es inválido", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));
    expect(screen.getByText(/no es válido/i)).toBeInTheDocument();
  });

  it("muestra error si un monto está vacío con nombre personalizado", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);
    await user.type(screen.getByPlaceholderText("Persona 1"), "Ana");
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));
    expect(screen.getByText(/Ana/i)).toBeInTheDocument();
    expect(screen.getByText(/no es válido/i)).toBeInTheDocument();
  });

  it("muestra 'Todo está igualado' cuando todos pagaron lo mismo", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    await user.type(amountInputs[0], "50");
    await user.type(amountInputs[1], "50");
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));

    expect(screen.getByText(/Todo está igualado/i)).toBeInTheDocument();
  });

  it("muestra las transacciones cuando los pagos son distintos", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    await user.type(amountInputs[0], "100");
    await user.type(amountInputs[1], "0");
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));

    expect(screen.getByText(/transferencia/i)).toBeInTheDocument();
  });

  it("agrega una nueva fila al hacer clic en '+ Añadir persona'", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    await user.click(screen.getByRole("button", { name: /Añadir persona/i }));

    expect(screen.getByPlaceholderText("Persona 3")).toBeInTheDocument();
  });

  it("el botón de eliminar está deshabilitado con solo 2 filas", () => {
    render(<ExpenseSettlement />);
    const deleteButtons = screen.getAllByRole("button", { name: /Eliminar persona/i });
    deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("permite eliminar una fila cuando hay más de 2", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    await user.click(screen.getByRole("button", { name: /Añadir persona/i }));
    expect(screen.getByPlaceholderText("Persona 3")).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: /Eliminar persona/i });
    await user.click(deleteButtons[2]); // elimina la tercera

    expect(screen.queryByPlaceholderText("Persona 3")).not.toBeInTheDocument();
  });

  it("resetea el estado al hacer 'Nueva liquidación'", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    await user.type(amountInputs[0], "50");
    await user.type(amountInputs[1], "50");
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));

    expect(screen.getByText(/Todo está igualado/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Nueva liquidación/i }));

    expect(screen.queryByText(/Todo está igualado/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Persona 1")).toBeInTheDocument();
  });

  it("limpia el resultado anterior al modificar los montos", async () => {
    const user = userEvent.setup();
    render(<ExpenseSettlement />);

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    await user.type(amountInputs[0], "50");
    await user.type(amountInputs[1], "50");
    await user.click(screen.getByRole("button", { name: /Calcular liquidación/i }));
    expect(screen.getByText(/Todo está igualado/i)).toBeInTheDocument();

    await user.clear(amountInputs[0]);
    expect(screen.queryByText(/Todo está igualado/i)).not.toBeInTheDocument();
  });
});
