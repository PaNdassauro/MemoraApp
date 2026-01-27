import { Badge } from "@/components/ui/badge";
import { WeddingStatus } from "@/lib/schemas/wedding";

interface WeddingStatusBadgeProps {
    status: WeddingStatus;
}

export function WeddingStatusBadge({ status }: WeddingStatusBadgeProps) {
    const getStatusColor = (status: WeddingStatus) => {
        switch (status) {
            case "Em produção":
                return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
            case "Finalizado":
                return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
            case "Publicado":
                return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
            case "Arquivado":
                return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Badge variant="outline" className={getStatusColor(status)}>
            {status}
        </Badge>
    );
}
