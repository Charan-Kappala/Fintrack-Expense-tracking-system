#!/bin/bash

echo "🗂️  FinTrack Lite - Code Explorer"
echo "=================================="

# Function to show file with syntax highlighting (if available)
show_file() {
    echo ""
    echo "📄 $1"
    echo "$(printf '=%.0s' {1..50})"
    if command -v bat &> /dev/null; then
        bat --style=numbers --theme=GitHub "$1"
    elif command -v highlight &> /dev/null; then
        highlight -O ansi "$1"
    else
        cat "$1"
    fi
    echo ""
}

# Main menu
while true; do
    echo ""
    echo "Choose what to explore:"
    echo "1. 📁 Project Structure"
    echo "2. 🔧 Main App Component (App.tsx)"
    echo "3. 📊 New Timeline Chart (SpendingTimeline.tsx)" 
    echo "4. 💾 Data Context (AppContext.tsx)"
    echo "5. 🔐 Auth Context (AuthContext.tsx)"
    echo "6. 🎨 Dashboard Layout (Dashboard.tsx)"
    echo "7. 📝 Types & Interfaces (types.ts)"
    echo "8. 🔄 Package Dependencies (package.json)"
    echo "9. 🗃️ Database Schema (supabase-schema.sql)"
    echo "10. 📋 Development Roadmap (ROADMAP.md)"
    echo "11. Exit"
    echo ""
    read -p "Enter your choice (1-11): " choice

    case $choice in
        1)
            echo ""
            echo "📁 Project Structure:"
            find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "./node_modules/*" | sort
            ;;
        2)
            show_file "App.tsx"
            ;;
        3)
            show_file "components/SpendingTimeline.tsx"
            ;;
        4)
            show_file "context/AppContext.tsx"
            ;;
        5)
            show_file "context/AuthContext.tsx"
            ;;
        6)
            show_file "components/Dashboard.tsx"
            ;;
        7)
            show_file "types.ts"
            ;;
        8)
            show_file "package.json"
            ;;
        9)
            show_file "supabase-schema.sql"
            ;;
        10)
            show_file "ROADMAP.md"
            ;;
        11)
            echo "Happy coding! 🚀"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
    
    read -p "Press Enter to continue..."
done