import { ListPageSkeleton } from "@/components/admin/page-skeletons";

export default function Loading() {
  return <ListPageSkeleton rows={8} columns={6} showStats={false} />;
}
