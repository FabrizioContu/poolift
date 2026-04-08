import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SplitEvenly } from "@/app/calculator/SplitEvenly";

// helpers
const getTotalInput = () => screen.getByPlaceholderText("0.00") as HTMLInputElement;
// spinbutton[0] = gasto total, spinbutton[1] = número de personas
const getCountInput = () => screen.getAllByRole("spinbutton")[1] as HTMLInputElement;

describe("SplitEvenly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza estado inicial correctamente", () => {
    render(<SplitEvenly />);
    expect(getTotalInput()).toBeInTheDocument();
    expect(getCountInput()).toHaveValue(2);
    expect(screen.getByRole("button", { name: /Calcular/i })).toBeInTheDocument();
  });

  it("muestra error si el monto está vacío", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/monto total válido/i)).toBeInTheDocument();
  });

  it("muestra error si el monto es 0", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "0");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/monto total válido/i)).toBeInTheDocument();
  });

  it("muestra error si hay menos de 2 personas", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "100");
    await user.clear(getCountInput());
    await user.type(getCountInput(), "1");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/al menos 2 personas/i)).toBeInTheDocument();
  });

  it("muestra error si hay más de 20 personas", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "100");
    await user.clear(getCountInput());
    await user.type(getCountInput(), "21");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/Máximo 20 personas/i)).toBeInTheDocument();
  });

  it("calcula y muestra 'Cada persona paga'", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "100");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/Cada persona paga/i)).toBeInTheDocument();
  });

  it("acepta initialNames y pre-carga el conteo", () => {
    render(<SplitEvenly initialNames={["Ana", "Luis", "Marta"]} />);
    expect(getCountInput()).toHaveValue(3);
  });

  it("muestra el desglose por nombre cuando initialNames está provisto", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly initialNames={["Ana", "Luis"]} />);
    await user.type(getTotalInput(), "80");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Luis")).toBeInTheDocument();
  });

  it("limpia el resultado al modificar el monto", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "100");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/Cada persona paga/i)).toBeInTheDocument();

    await user.clear(getTotalInput());
    await user.type(getTotalInput(), "200");
    expect(screen.queryByText(/Cada persona paga/i)).not.toBeInTheDocument();
  });

  it("limpia el resultado al cambiar la cantidad de personas", async () => {
    const user = userEvent.setup();
    render(<SplitEvenly />);
    await user.type(getTotalInput(), "100");
    await user.click(screen.getByRole("button", { name: /Calcular/i }));
    expect(screen.getByText(/Cada persona paga/i)).toBeInTheDocument();

    await user.clear(getCountInput());
    await user.type(getCountInput(), "3");
    expect(screen.queryByText(/Cada persona paga/i)).not.toBeInTheDocument();
  });
});
