import { useState } from "react";
import apiData from "../../api-data.json";
import "./ActivityStats.scss";

type ActivityData = {
  type: string;
  count: number;
  fiat_currency: string;
  amount_fiat: string;
  crypto_currency: string;
  amount_crypto: number;
};

type CombinedData = {
  type: string;
  count: number;
  fiat_currency: string;
  amount_fiat: number;
  crypto_currencies: Set<string>;
};

export const ActivityRow = ({ rowData }: { rowData: CombinedData }) => {
  const { type, count, fiat_currency, amount_fiat, crypto_currencies } =
    rowData;
  return (
    <div className="activity__row" role="listitem">
      <h3 className="activity__row__label">Total {type}s</h3>
      <div className="activity__row__total">
        {formatCurrency(amount_fiat, fiat_currency)}
      </div>
      <div className="activity__row__crypto">
        {crypto_currencies.size === 1
          ? `${Array.from(crypto_currencies)[0]}`
          : `${Array.from(crypto_currencies)[0]} + ${
              crypto_currencies.size - 1
            } others`}
      </div>
      <div className="activity__row__transactions">
        {count} Transaction{count > 1 ? "s" : ""}
      </div>
    </div>
  );
};

const ActivityStats = () => {
  const [activityData] = useState<Map<string, CombinedData>>(() => {
    return combineDataRows(apiData.activity_summary);
  });

  return (
    <div className="activity">
      <h1>Activity</h1>
      <div className="activity__inner">
        <div className="activity__header">
          <h2>Transactions</h2>
          <button type="button" aria-label="Opens full report in a modal">
            View Report
          </button>
        </div>
        {activityData ? (
          <div className="activity__rows" role="list">
            {Array.from(activityData.entries()).map(([type, info]) => {
              return <ActivityRow key={type} rowData={info} />;
            })}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export const formatCurrency = (amount: number | string, currency: string) => {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });

  return currencyFormat.format(Number(amount));
};

export const combineDataRows = (
  data: ActivityData[]
): Map<string, CombinedData> => {
  const combinedData = new Map();

  data.forEach(
    ({ type, count, amount_fiat, fiat_currency, crypto_currency }) => {
      if (combinedData.has(type)) {
        // Existing entry updates
        const prevData = combinedData.get(type);

        const newCombined = {
          ...prevData,
          count: prevData.count + count,
          amount_fiat: prevData.amount_fiat + Number(amount_fiat),
          crypto_currencies: prevData.crypto_currencies.has(crypto_currency)
            ? prevData.crypto_currencies
            : prevData.crypto_currencies.add(crypto_currency),
        };
        combinedData.set(type, newCombined);
      } else {
        // New Entry Creation
        combinedData.set(type, {
          count,
          amount_fiat: Number(amount_fiat),
          fiat_currency,
          type,
          crypto_currencies: new Set([crypto_currency]),
        });
      }
    }
  );

  return combinedData;
};

export default ActivityStats;
