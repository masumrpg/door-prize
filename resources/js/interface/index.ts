// Types
export interface Employee {
    id: string;
    name: string;
    employeeId: string;
}

export interface Prize {
    id: string;
    name: string;
    imageUrl: string;
    color: string;
    stock: number;
    totalStock: number;
}

export interface Winner {
    id: string;
    employee: Employee;
    prize: Prize;
    timestamp: string;
    winnerNumber: number;
}

export interface AllWinnersModalProps {
    prizes: Prize[];
    winners: Winner[];
    setShowAllPrizes: (value: boolean) => void;
}

export interface FinishedPopupProps {
    setShowFinishedPopup: (value: boolean) => void;
    setShowAllPrizes: (value: boolean) => void;
}

export interface StockFinishedPopupProps {
    currentPrize: Prize | null
    setShowStockFinishedPopup: (value: boolean) => void
}
