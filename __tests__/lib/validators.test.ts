import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateBirthdayDelete,
  validatePartyDelete,
  validateProposalDelete,
} from "@/lib/validators";

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from "@/lib/supabase";

const mockSupabase = supabase as unknown as {
  from: ReturnType<typeof vi.fn>;
};

describe("validators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateBirthdayDelete", () => {
    it("permite eliminar si no hay fiestas asociadas", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await validateBirthdayDelete("birthday-123");

      expect(result.canDelete).toBe(true);
    });

    it("bloquea si hay fiestas asociadas", async () => {
      const mockSelect = vi.fn();
      const mockEq = vi.fn();

      // First call for party_celebrants - returns parties
      mockEq.mockResolvedValueOnce({
        data: [{ party_id: "p1" }, { party_id: "p2" }],
        error: null,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(validateBirthdayDelete("birthday-123")).rejects.toThrow(
        "No se puede eliminar. Este nino esta en 2 fiesta(s) activa(s)."
      );
    });
  });

  describe("validatePartyDelete", () => {
    it("permite eliminar si no hay propuestas", async () => {
      const mockSelect = vi.fn();
      const mockEq = vi.fn();

      // proposals - none
      mockEq.mockResolvedValueOnce({ data: [], error: null });
      // gifts - none
      mockEq.mockResolvedValueOnce({ data: [], error: null });
      // party_celebrants - none
      mockEq.mockResolvedValueOnce({ data: [], error: null });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await validatePartyDelete("party-123");

      expect(result.canDelete).toBe(true);
    });

    it("bloquea si hay propuestas", async () => {
      const mockSelect = vi.fn();
      const mockEq = vi.fn();

      // proposals - has proposals
      mockEq.mockResolvedValueOnce({
        data: [{ id: "prop1" }],
        error: null,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(validatePartyDelete("party-123")).rejects.toThrow(
        "No se puede eliminar. Esta fiesta tiene 1 propuesta(s)."
      );
    });

    it("bloquea si hay regalo creado", async () => {
      const mockSelect = vi.fn();
      const mockEq = vi.fn();

      // proposals - none
      mockEq.mockResolvedValueOnce({ data: [], error: null });
      // gifts - has gift
      mockEq.mockResolvedValueOnce({
        data: [{ id: "gift1" }],
        error: null,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(validatePartyDelete("party-123")).rejects.toThrow(
        "No se puede eliminar. Ya hay un regalo creado para esta fiesta."
      );
    });
  });

  describe("validateProposalDelete", () => {
    it("permite eliminar si no está seleccionada", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValueOnce({ data: { is_selected: false }, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await validateProposalDelete("proposal-123");

      expect(result.canDelete).toBe(true);
    });

    it("bloquea si está seleccionada", async () => {
      const mockSingle = vi
        .fn()
        .mockResolvedValueOnce({ data: { is_selected: true }, error: null });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(validateProposalDelete("proposal-123")).rejects.toThrow(
        "No se puede eliminar. Esta es la propuesta seleccionada para el regalo."
      );
    });
  });
});
