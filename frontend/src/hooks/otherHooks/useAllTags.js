import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTags } from "../../features/problems/problemsSlice";

export function useAllTags() {
  const dispatch = useDispatch();

  const { tags, tagsLoading, tagsError } = useSelector(
    (state) => state.problems
  );

  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, tags.length]);

  return { tags, tagsLoading, tagsError };
}
