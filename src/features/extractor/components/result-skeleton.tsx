import { Skeleton } from "@/components/ui/skeleton";

export function ResultSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-4">
      <Skeleton className="h-3.5 w-32" />
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-72 w-full rounded-[1.35rem]" />
    </div>
  );
}
