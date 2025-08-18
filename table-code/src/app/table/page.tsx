// src/app/table/page.tsx
import ReactTable from "@/components/Tanstack-table";


export default function TablePage() {
    type Trade = {
        spot: string;
        price: number;
        change: number;
        sparkline: number[];
    };
    function generateFakeData(count = 20): Trade[] {
        const spots = [
            "AAPL",
            "GOOG",
            "TSLA",
            "AMZN",
            "MSFT",
            "NFLX",
            "FB",
            "NVDA",
            "BABA",
            "DIS",
            "UBER",
            "SQ",
            "PYPL",
            "INTC",
        ];

        const data: Trade[] = [];

        for (let i = 0; i < count; i++) {
            const spot = spots[i % spots.length];
            const price = +(Math.random() * 1000 + 100).toFixed(2); // random price 100–1100
            const change = +(Math.random() * 10 - 5).toFixed(2); // random change -5% to +5%
            const sparkline = Array.from({ length: 20 }, () =>
                +(price * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)
            ); // random sparkline

            data.push({ spot, price, change, sparkline });
        }

        return data;
    }
    return (
        <div>
            <h1>Table Page</h1>
            <ReactTable  data={generateFakeData()}/>
        </div>
    );
}
