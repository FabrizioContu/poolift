"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Home, Users, Search, Gift } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getGroupSessions, GroupSession, getDirectGiftSessions, DirectGiftSession } from "@/lib/auth";
import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/Button";
import { OCCASION_LABELS, type OccasionType } from "@/lib/types";

interface GroupWithCounts {
  id: string;
  name: string;
  invite_code: string;
  familyCount: number;
  partyCount: number;
}

// Initialize sessions synchronously from localStorage
function getInitialSessions(): GroupSession[] {
  if (typeof window === "undefined") return [];
  return getGroupSessions();
}

// Initialize direct gifts synchronously from localStorage
function getInitialDirectGifts(): DirectGiftSession[] {
  if (typeof window === "undefined") return [];
  return getDirectGiftSessions();
}

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<
    (GroupWithCounts & { isCreator: boolean })[]
  >([]);
  const [allGroups, setAllGroups] = useState<GroupWithCounts[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState<GroupSession[]>(getInitialSessions);
  const [directGifts, setDirectGifts] = useState<DirectGiftSession[]>(getInitialDirectGifts);

  useEffect(() => {
    let isMounted = true;

    async function loadAllGroups() {
      const { data } = await supabase
        .from("groups")
        .select(
          `
          id,
          name,
          invite_code,
          families!families_group_id_fkey(id),
          parties(id)
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && isMounted) {
        const groupsWithCounts = data.map((g) => ({
          id: g.id,
          name: g.name,
          invite_code: g.invite_code,
          familyCount: g.families?.length || 0,
          partyCount: g.parties?.length || 0,
        }));
        setAllGroups(groupsWithCounts);
      }
    }

    async function loadGroups() {
      const savedSessions = getGroupSessions();
      const savedDirectGifts = getDirectGiftSessions();
      if (isMounted) {
        setSessions(savedSessions);
        setDirectGifts(savedDirectGifts);
      }

      if (savedSessions.length > 0) {
        const groupIds = savedSessions.map((s) => s.groupId);

        const { data: groups } = await supabase
          .from("groups")
          .select(
            `
            id,
            name,
            invite_code,
            families!families_group_id_fkey(id),
            parties(id)
          `
          )
          .in("id", groupIds);

        if (groups && isMounted) {
          const groupsWithCounts = groups.map((g) => {
            const session = savedSessions.find((s) => s.groupId === g.id);
            return {
              id: g.id,
              name: g.name,
              invite_code: g.invite_code,
              familyCount: g.families?.length || 0,
              partyCount: g.parties?.length || 0,
              isCreator: session?.isCreator || false,
            };
          });
          setMyGroups(groupsWithCounts);
        }
      } else if (savedDirectGifts.length === 0) {
        // Only show all groups if user has no groups AND no direct gifts
        if (isMounted) {
          setShowAll(true);
        }
        await loadAllGroups();
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleShowAll = async () => {
    if (!showAll && allGroups.length === 0) {
      // Load all groups if not already loaded
      const { data } = await supabase
        .from("groups")
        .select(
          `
          id,
          name,
          invite_code,
          families!families_group_id_fkey(id),
          parties(id)
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        const groupsWithCounts = data.map((g) => ({
          id: g.id,
          name: g.name,
          invite_code: g.invite_code,
          familyCount: g.families?.length || 0,
          partyCount: g.parties?.length || 0,
        }));
        setAllGroups(groupsWithCounts);
      }
    }
    setShowAll(!showAll);
  };

  const displayedGroups = showAll ? allGroups : myGroups;
  const filteredGroups = displayedGroups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {showAll ? "Todos los Grupos" : "Mis Grupos"}
            </h1>
            <p className="text-gray-600 mt-1">
              {showAll
                ? "Explora grupos disponibles"
                : "Grupos donde participas"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="secondary" className="flex items-center gap-2">
                <Home size={18} />
                Inicio
              </Button>
            </Link>
            <Link href="/create-group">
              <Button className="flex items-center gap-2">
                <Plus size={18} />
                Crear Grupo
              </Button>
            </Link>
          </div>
        </div>

        {/* Toggle & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {sessions.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleToggleShowAll}
              className="flex items-center gap-2"
            >
              <Users size={18} />
              {showAll ? "Ver Mis Grupos" : "Ver Todos"}
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando grupos...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            {searchTerm ? (
              <>
                <p className="text-gray-600 font-medium">
                  No se encontraron grupos
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Intenta con otro término de búsqueda
                </p>
              </>
            ) : showAll ? (
              <>
                <p className="text-gray-600 font-medium">
                  No hay grupos disponibles
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  ¡Sé el primero en crear uno!
                </p>
              </>
            ) : directGifts.length > 0 ? (
              <>
                <p className="text-gray-600 font-medium">
                  No tienes grupos aún
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Pero tienes regalos directos abajo
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium">
                  No tienes grupos aún
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Crea un grupo nuevo o únete a uno existente
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <Link href="/create-group">
                    <Button>Crear Grupo</Button>
                  </Link>
                  <Link href="/join">
                    <Button variant="secondary">Unirse a Grupo</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isCreator={
                  "isCreator" in group
                    ? (group as GroupWithCounts & { isCreator: boolean })
                        .isCreator
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Direct Gifts Section */}
        {directGifts.length > 0 && !showAll && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Gift size={24} className="text-green-600" />
              Mis Regalos Directos
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {directGifts.map((gift) => (
                <Link
                  key={gift.shareCode}
                  href={`/gifts/${gift.shareCode}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mb-2">
                        {OCCASION_LABELS[gift.occasion as OccasionType]}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        Regalo para {gift.recipientName}
                      </h3>
                      {gift.giftIdea && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {gift.giftIdea}
                        </p>
                      )}
                    </div>
                    <Gift size={20} className="text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Organizado por {gift.organizerName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Join link */}
        {!showAll && sessions.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ¿Tienes un código de invitación?{" "}
              <Link
                href="/join"
                className="text-blue-600 hover:underline font-medium"
              >
                Únete a un grupo
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
