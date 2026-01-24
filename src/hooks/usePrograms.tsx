import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface Program {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string | null;
  impact: string | null;
  icon_name: string;
  color: string;
  goal: number;
  raised: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Program[];
    },
  });
};

export const useProgram = (slug: string) => {
  return useQuery({
    queryKey: ["program", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Program;
    },
    enabled: !!slug,
  });
};

export const useProgramImages = (programId: string) => {
  return useQuery({
    queryKey: ["program-images", programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("program_images")
        .select("*")
        .eq("program_id", programId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!programId,
  });
};

// Real-time hook for donation updates
export const useRealtimeDonations = () => {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (data) setPrograms(data as Program[]);
    };

    fetchPrograms();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("programs-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "programs",
        },
        (payload) => {
          setPrograms((prev) =>
            prev.map((p) => (p.id === payload.new.id ? (payload.new as Program) : p))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return programs;
};
