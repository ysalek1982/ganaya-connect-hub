import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tutorial, TutorialOwnerType } from '@/lib/firebase-types';

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Fetch tutorials for an agent (their own + global)
export const useAgentTutorials = (agentUid: string | null) => {
  return useQuery({
    queryKey: ['agent-tutorials', agentUid],
    queryFn: async (): Promise<Tutorial[]> => {
      if (!agentUid) return [];

      const tutorialsRef = collection(db, 'tutorials');
      const q = query(
        tutorialsRef, 
        where('ownerUid', '==', agentUid),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ownerType: data.ownerType || 'AGENT',
          ownerUid: data.ownerUid || null,
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          contentMarkdown: data.contentMarkdown || '',
          videoUrl: data.videoUrl || null,
          countryTags: data.countryTags || [],
          order: data.order || 0,
          isPublished: data.isPublished ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tutorial;
      });
    },
    enabled: !!agentUid,
  });
};

// Fetch all tutorials (for admin)
export const useAllTutorials = () => {
  return useQuery({
    queryKey: ['all-tutorials'],
    queryFn: async (): Promise<Tutorial[]> => {
      const tutorialsRef = collection(db, 'tutorials');
      const snapshot = await getDocs(query(tutorialsRef, orderBy('order', 'asc')));
      
      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ownerType: data.ownerType || 'AGENT',
          ownerUid: data.ownerUid || null,
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          contentMarkdown: data.contentMarkdown || '',
          videoUrl: data.videoUrl || null,
          countryTags: data.countryTags || [],
          order: data.order || 0,
          isPublished: data.isPublished ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tutorial;
      });
    },
  });
};

// Fetch global tutorials only
export const useGlobalTutorials = (publishedOnly = true) => {
  return useQuery({
    queryKey: ['global-tutorials', publishedOnly],
    queryFn: async (): Promise<Tutorial[]> => {
      const tutorialsRef = collection(db, 'tutorials');
      let q = query(
        tutorialsRef, 
        where('ownerType', '==', 'GLOBAL'),
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      let tutorials = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ownerType: data.ownerType || 'GLOBAL',
          ownerUid: null,
          title: data.title || '',
          slug: data.slug || '',
          summary: data.summary || '',
          contentMarkdown: data.contentMarkdown || '',
          videoUrl: data.videoUrl || null,
          countryTags: data.countryTags || [],
          order: data.order || 0,
          isPublished: data.isPublished ?? false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate(),
        } as Tutorial;
      });

      if (publishedOnly) {
        tutorials = tutorials.filter(t => t.isPublished);
      }

      return tutorials;
    },
  });
};

// Create tutorial
export const useCreateTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      ownerType: TutorialOwnerType;
      ownerUid?: string | null;
      title: string;
      summary: string;
      contentMarkdown?: string;
      videoUrl?: string | null;
      countryTags?: string[];
      order?: number;
      isPublished?: boolean;
    }) => {
      const tutorialsRef = collection(db, 'tutorials');
      const slug = generateSlug(data.title);
      
      const docRef = await addDoc(tutorialsRef, {
        ownerType: data.ownerType,
        ownerUid: data.ownerUid || null,
        title: data.title,
        slug,
        summary: data.summary,
        contentMarkdown: data.contentMarkdown || '',
        videoUrl: data.videoUrl || null,
        countryTags: data.countryTags || [],
        order: data.order || 0,
        isPublished: data.isPublished ?? false,
        createdAt: Timestamp.now(),
      });
      
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['global-tutorials'] });
    },
  });
};

// Update tutorial
export const useUpdateTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tutorial> }) => {
      const tutorialRef = doc(db, 'tutorials', id);
      
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      // Update slug if title changed
      if (data.title) {
        updateData.slug = generateSlug(data.title);
      }
      
      await updateDoc(tutorialRef, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['global-tutorials'] });
    },
  });
};

// Delete tutorial
export const useDeleteTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const tutorialRef = doc(db, 'tutorials', id);
      await deleteDoc(tutorialRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['all-tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['global-tutorials'] });
    },
  });
};

export default useAgentTutorials;
