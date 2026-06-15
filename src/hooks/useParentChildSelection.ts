import { useEffect, useMemo, useState } from 'react';
import { api, type Child } from '../services/api';

const STORAGE_KEY = 'charmchime_parent_selected_child_id';

export const useParentChildSelection = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [childrenError, setChildrenError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoadingChildren(true);
    setChildrenError('');

    api.parents
      .children()
      .then(({ children: linkedChildren }) => {
        if (!isMounted) return;

        const safeChildren = linkedChildren || [];
        const storedChildId = localStorage.getItem(STORAGE_KEY) || '';
        const nextSelectedId = safeChildren.some((child) => child.id === storedChildId)
          ? storedChildId
          : safeChildren[0]?.id || '';

        setChildren(safeChildren);
        setSelectedChildId(nextSelectedId);
        if (nextSelectedId) {
          localStorage.setItem(STORAGE_KEY, nextSelectedId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setChildren([]);
        setSelectedChildId('');
        setChildrenError(err instanceof Error ? err.message : 'Could not load linked children.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingChildren(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) || null,
    [children, selectedChildId]
  );

  const selectChild = (childId: string) => {
    setSelectedChildId(childId);
    if (childId) {
      localStorage.setItem(STORAGE_KEY, childId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId: selectChild,
    isLoadingChildren,
    childrenError,
    hasNoLinkedChildren: !isLoadingChildren && children.length === 0,
  };
};
