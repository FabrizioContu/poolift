"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Plus, Home, Users, Search, Gift, Lock, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getGroupSessions,
  getDirectGiftSessions,
  DirectGiftSession,
  removeDirectGiftSession,
  useAuth,
} from "@/lib/auth";
import { migrateAnonData } from "@/lib/migrate";
import { GroupCard } from "@/components/groups/GroupCard";
import { Button } from "@/components/ui/Button";
import { OCCASION_LABELS, type OccasionType } from "@/lib/types";

const AuthModal = dynamic(() =>
  import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal }))
);

interface GroupWithCounts {
  id: string;
  name: string;
  invite_code: string;
  familyCount: number;
  partyCount: number;
}

// Initialize direct gifts synchronously from localStorage
function getInitialDirectGifts(): DirectGiftSession[] {
  if (typeof window === "undefined") return [];
  return getDirectGiftSessions();
}

export default function GroupsPage() {
  const { user, isAnonymous, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<
    (GroupWithCounts & { isCreator: boolean })[]
  >([]);
  const [allGroups, setAllGroups] = useState<GroupWithCounts[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [directGifts, setDirectGifts] =
    useState<DirectGiftSession[]>(getInitialDirectGifts);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    async function loadGroups() {
      let savedDirectGifts = getDirectGiftSessions();

      // Validate direct gifts against Supabase - remove cancelled/deleted ones
      if (savedDirectGifts.length > 0) {
        const shareCodes = savedDirectGifts.map((g) => g.shareCode);
        const { data: validGifts } = await supabase
          .from("direct_gifts")
          .select("share_code, status")
          .in("share_code", shareCodes)
          .neq("status", "cancelled");

        const validShareCodes = new Set(
          validGifts?.map((g) => g.share_code) || []
        );

        savedDirectGifts.forEach((gift) => {
          if (!validShareCodes.has(gift.shareCode)) {
            removeDirectGiftSession(gift.shareCode);
          }
        });

        savedDirectGifts = savedDirectGifts.filter((g) =>
          validShareCodes.has(g.shareCode)
        );
      }

      if (isMounted) {
        setDirectGifts(savedDirectGifts);
      }

      // Always load all groups (for anonymous locked view and authenticated toggle)
      const { data: allGroupsData } = await supabase
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

      if (allGroupsData && isMounted) {
        setAllGroups(
          allGroupsData.map((g) => ({
            id: g.id,
            name: g.name,
            invite_code: g.invite_code,
            familyCount: g.families?.length || 0,
            partyCount: g.parties?.length || 0,
          }))
        );
      }

      if (!isAnonymous && user) {
        // Auto-migrate if localStorage still has sessions from before Phase 5
        const pendingSessions = getGroupSessions();
        if (pendingSessions.length > 0) {
          await migrateAnonData();
        }

        // Load my groups from DB via families.user_id
        const { data: myFamilies } = await supabase
          .from("families")
          .select("id, is_creator, group_id")
          .eq("user_id", user.id);

        if (myFamilies && myFamilies.length > 0) {
          const groupIds = myFamilies.map((f) => f.group_id);
          const familyMap = new Map(myFamilies.map((f) => [f.group_id, f]));

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
            setMyGroups(
              groups.map((g) => ({
                id: g.id,
                name: g.name,
                invite_code: g.invite_code,
                familyCount: g.families?.length || 0,
                partyCount: g.parties?.length || 0,
                isCreator: familyMap.get(g.id)?.is_creator || false,
              }))
            );
          }
        } else if (isMounted && savedDirectGifts.length === 0) {
          setShowAll(true);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAnonymous, user]);

  const handleToggleShowAll = () => {
    setShowAll(!showAll);
  };

  // For anonymous: always show allGroups (locked)
  // For authenticated: show myGroups or allGroups based on toggle
  const displayedGroups = isAnonymous
    ? allGroups
    : showAll
      ? allGroups
      : myGroups;

  const filteredGroups = displayedGroups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAnonymous
                ? "Grupos"
                : showAll
                  ? "Todos los Grupos"
                  : "Mis Grupos"}
            </h1>
            <p className="text-gray-700 mt-1">
              {isAnonymous
                ? "Inicia sesión para acceder a tus grupos"
                : showAll
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
            {!isAnonymous && (
              <Link href="/create-group">
                <Button className="flex items-center gap-2">
                  <Plus size={18} />
                  Crear Grupo
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Auth banner for anonymous users */}
        {!authLoading && isAnonymous && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="text-blue-600 flex-shrink-0" size={20} />
              <p className="text-blue-800 text-sm">
                Inicia sesión para ver si tienes acceso a estos grupos
              </p>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <LogIn size={16} />
              Entrar
            </Button>
          </div>
        )}

        {/* Toggle & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
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
          {!isAnonymous && myGroups.length > 0 && (
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
        {loading || authLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-700 mt-4">Cargando grupos...</p>
          </div>
        ) : isAnonymous ? (
          // Anonymous: locked group cards
          filteredGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-700 font-medium">
                No hay grupos disponibles
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-lg p-6 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Users className="text-gray-400" size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {group.name}
                        </h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {group.familyCount !== undefined && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {group.familyCount}{" "}
                              {group.familyCount === 1 ? "familia" : "familias"}
                            </span>
                          )}
                          {group.partyCount !== undefined &&
                            group.partyCount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {group.partyCount}{" "}
                                {group.partyCount === 1 ? "fiesta" : "fiestas"}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <Lock className="text-gray-400 flex-shrink-0" size={18} />
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 text-center py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    Inicia sesión para ver si tienes acceso
                  </button>
                </div>
              ))}
            </div>
          )
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            {searchTerm ? (
              <>
                <p className="text-gray-700 font-medium">
                  No se encontraron grupos
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  Intenta con otro término de búsqueda
                </p>
              </>
            ) : showAll ? (
              <>
                <p className="text-gray-700 font-medium">
                  No hay grupos disponibles
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  ¡Sé el primero en crear uno!
                </p>
              </>
            ) : directGifts.length > 0 ? (
              <>
                <p className="text-gray-700 font-medium">
                  No tienes grupos aún
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  Pero tienes regalos directos abajo
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">
                  No tienes grupos aún
                </p>
                <p className="text-gray-700 text-sm mt-1">
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

        {/* Direct Gifts Section (only for authenticated users) */}
        {!isAnonymous && directGifts.length > 0 && !showAll && (
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
                        <p className="text-sm text-gray-700 mt-1 line-clamp-1">
                          {gift.giftIdea}
                        </p>
                      )}
                    </div>
                    <Gift size={20} className="text-green-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-700 mt-2">
                    Organizado por {gift.organizerName}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Join link (only for authenticated users with groups) */}
        {!isAnonymous && !showAll && myGroups.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-700 text-sm">
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

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
