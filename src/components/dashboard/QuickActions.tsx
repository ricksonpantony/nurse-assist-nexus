import { Button } from "@/components/ui/button";
import { UserPlus, BookPlus, CreditCard, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export const QuickActions = () => {
  const actions = [
    { 
      label: "Add Student", 
      icon: UserPlus, 
      href: "/students/manage", 
      color: "bg-blue-600 hover:bg-blue-700",
      tooltip: "Register a new student"
    },
    { 
      label: "Create Course", 
      icon: BookPlus, 
      href: "/courses", 
      color: "bg-indigo-600 hover:bg-indigo-700",
      tooltip: "Add a new course"
    },
    { 
      label: "View Payments", 
      icon: CreditCard, 
      href: "/students", 
      color: "bg-emerald-600 hover:bg-emerald-700",
      tooltip: "Manage student payments"
    },
    { 
      label: "Generate Report", 
      icon: BarChart3, 
      href: "/reports", 
      color: "bg-purple-600 hover:bg-purple-700",
      tooltip: "View analytics and reports"
    },
  ];

  return (
    <div className="flex gap-3">
      {actions.map((action, index) => (
        <Button
          key={action.label}
          asChild
          size="sm"
          className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-4 py-2`}
          title={action.tooltip}
        >
          <Link to={action.href} className="flex items-center gap-2">
            <action.icon className="w-4 h-4" />
            <span className="hidden lg:inline">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
};
