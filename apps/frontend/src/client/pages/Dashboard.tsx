import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { OwnerDashboardResponse } from '@RealEstate/types';
import { ApiError } from '../../shared/api/client';
import { ownerApi } from '../../shared/api/services';
import ErrorPanel, { type Variant as ErrorVariant } from '../../shared/components/ErrorPanel/ErrorPanel';
import Skeleton from '../../shared/components/Skeleton/Skeleton';
import OwnerKpiStrip from '../components/OwnerKpiStrip';
import IncomeChart from '../components/IncomeChart';
import UpcomingCheckins from '../components/UpcomingCheckins';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const property = searchParams.get('property') || undefined;
  const [data, setData] = useState<OwnerDashboardResponse | null>(null);
  const [error, setError] = useState<{ variant: ErrorVariant; message: string } | null>(null);

  useEffect(() => {
    // Reset to the skeleton on every switch; ignore a stale in-flight response
    // if the selection changes again before it resolves.
    let active = true;
    setData(null);
    setError(null);
    ownerApi.dashboard(property)
      .then(d => { if (active) setData(d); })
      .catch((err: Error) => {
        if (active) setError({
          variant: err instanceof ApiError ? 'api-error' : 'network-error',
          message: err.message,
        });
      });
    return () => { active = false; };
  }, [property]);

  const loading = !error && data === null;

  return (
    <section>
      {error && <ErrorPanel variant={error.variant} message={error.message} />}

      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 max-card:grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
                <Skeleton count={3} />
              </div>
            ))}
          </div>
          <div className="bg-surface border border-border rounded-[14px] p-[16px_18px] shadow-sm">
            <Skeleton count={5} />
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <OwnerKpiStrip kpis={data.kpis} />
          <div className="grid grid-cols-[1.5fr_1fr] grid-rows-[minmax(0,1fr)] h-[clamp(320px,46vh,560px)] max-card:grid-cols-1 max-card:grid-rows-none max-card:h-auto gap-4">
            <IncomeChart data={data.incomeChart} />
            <UpcomingCheckins checkins={data.upcomingCheckins} />
          </div>
        </div>
      )}
    </section>
  );
}
