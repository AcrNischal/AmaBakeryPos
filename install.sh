#!/bin/bash

echo "📦 AmaBakery POS - Installation & Setup"
echo "========================================="

# 1. Create start.sh
cat >start.sh <<'EOF'
#!/bin/bash

# -------- Simple Start Functions --------
djstart() {
    if [ ! -d "Backend/mysite" ]; then
        echo "❌ Django project not found (Backend/mysite)"
        return 1
    fi

    cd Backend || return
    [ -d "env" ] || { echo "❌ env not found"; return 1; }
    . env/bin/activate
    cd mysite || return
    python manage.py runserver 0.0.0.0:8000
}

nodestart() {
    if [ ! -d "frontend" ]; then
        echo "❌ Frontend folder not found"
        return 1
    fi

    cd frontend || return
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm run dev -- --host 0.0.0.0 --port 8080
}

sdn() {
    echo "🚀 Starting Django and Node servers..."
    djstart > /tmp/django_start.log 2>&1 &
    DJ_PID=$!
    nodestart > /tmp/node_start.log 2>&1 &
    NODE_PID=$!
    
    echo "✅ Servers started in background!"
    echo "   Django PID: $DJ_PID"
    echo "   Node PID: $NODE_PID"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:8080"
    echo "   Backend:  http://127.0.0.1:8000"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    trap 'kill $DJ_PID $NODE_PID 2>/dev/null; echo " Servers stopped"; exit' INT
    wait
}

# -------- Kill Functions --------
kill_django() {
    echo "🔫 Killing Django on port 8000..."
    local PID
    PID="$(lsof -ti tcp:8000 2>/dev/null || true)"
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "✅ Django killed (PID: $PID)"
    else
        echo "ℹ️ No Django process found on port 8000"
    fi
}

kill_node() {
    echo "🔫 Killing Node on port 8080..."
    local PID
    PID="$(lsof -ti tcp:8080 2>/dev/null || true)"
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "✅ Node killed (PID: $PID)"
    else
        echo "ℹ️ No Node process found on port 8080"
    fi
}

kill_all() {
    echo "🔫 Killing all servers..."
    kill_django
    kill_node
}

killallport() {
    ports=(3000 8080 8000 5000)
    for p in "${ports[@]}"; do
        if lsof -ti tcp:$p >/dev/null 2>&1; then
            local PID
            PID="$(lsof -ti tcp:$p)"
            kill -9 $PID 2>/dev/null || true
            echo "✅ Killed port $p (PID: $PID)"
        fi
    done
}

# -------- Main Start Logic --------
if [ "$1" = "django" ] || [ "$1" = "dj" ]; then
    djstart
elif [ "$1" = "node" ] || [ "$1" = "frontend" ]; then
    nodestart
elif [ "$1" = "kill" ]; then
    if [ "$2" = "django" ] || [ "$2" = "dj" ]; then
        kill_django
    elif [ "$2" = "node" ] || [ "$2" = "frontend" ]; then
        kill_node
    elif [ "$2" = "ports" ]; then
        killallport
    else
        kill_all
    fi
else
    sdn
fi
EOF

chmod +x start.sh
echo "✅ Created start.sh"

# 2. Create reset.sh
cat >reset.sh <<'RESET_EOF'
#!/bin/bash

# -------- Kill Functions --------
kill_django() {
    echo "🔫 Killing Django on port 8000..."
    local PID
    PID="$(lsof -ti tcp:8000 2>/dev/null || true)"
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "✅ Django killed (PID: $PID)"
    else
        echo "ℹ️ No Django process found on port 8000"
    fi
}

kill_node() {
    echo "🔫 Killing Node on port 8080..."
    local PID
    PID="$(lsof -ti tcp:8080 2>/dev/null || true)"
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "✅ Node killed (PID: $PID)"
    else
        echo "ℹ️ No Node process found on port 8080"
    fi
}

# -------- Comprehensive Reset & Start Functions --------
start_django() {
    local BACKEND_DIR=""
    local MYSITE_DIR=""
    
    # Detect Django project
    if [ -d "Backend/backend/mysite" ]; then
        BACKEND_DIR="Backend/backend"
        MYSITE_DIR="Backend/backend/mysite"
    elif [ -d "Backend/mysite" ]; then
        BACKEND_DIR="Backend"
        MYSITE_DIR="Backend/mysite"
    elif [ -d "backend/mysite" ]; then
        BACKEND_DIR="backend"
        MYSITE_DIR="backend/mysite"
    fi

    if [ -z "$MYSITE_DIR" ]; then
        echo "❌ Django project not found!"
        return 1
    fi

    echo "🚀 Resetting & Starting Django backend..."
    kill_django
    
    pushd "$BACKEND_DIR" >/dev/null
    
    # 1. Reset Environment
    [ -d "env" ] && rm -rf env
    python3 -m venv env
    source env/bin/activate
    
    # 2. Install Dependencies
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        pip install django djangorestframework django-cors-headers
    fi

    cd "$(basename "$MYSITE_DIR")"

    # 3. Reset Database
    [ -f "db.sqlite3" ] && rm db.sqlite3
    python3 manage.py makemigrations 2>/dev/null || true
    python3 manage.py migrate 2>&1 | grep -v "WARNINGS" || true
    
    # 4. Seed Dummy Data
    echo "🌱 Seeding realistic data (Branches, Managers, Staff, Products, Floors)..."
    python3 manage.py shell <<EOF
import random
from django.contrib.auth import get_user_model
from api.models import Branch, Kitchentype, ProductCategory, Product, Floor

User = get_user_model()

try:
    # --- Superuser ---
    User.objects.create_superuser('su', 'su@gmail.com', 'su', user_type='ADMIN')
    print('✅ Admin: su / su')

    # --- Branches ---
    branches_data = [
        ('Ama Main Bakery', 'Downtown Plaza'),
        ('Ama Cake Shop', 'Riverside Mall'),
        ('Ama Heritage Cafe', 'Central Square'),
        ('Ama Pastry House', 'East End'),
        ('Ama Express', 'Terminal 1')
    ]

    kitchen_names = ['Main Oven', 'Cold Store', 'Drink Bar', 'Decoration Room', 'Prep Station']
    
    category_data = [
        ('Handcrafted Bread', ['Sourdough', 'French Baguette', 'Whole Wheat', 'Garlic Loaf', 'Focaccia']),
        ('Signature Cakes', ['Black Forest', 'Red Velvet', 'Vanilla Bean', 'Tiramisu', 'Fruit Fiesta']),
        ('Fresh Pastries', ['Croissant', 'Pain au Chocolat', 'Apple Turnover', 'Fruit Tart', 'Cheese Puff']),
        ('Cookies', ['Choco Chip', 'Oatmeal Raisin', 'Peanut Butter', 'Macarons', 'Biscotti']),
        ('Beverages', ['Americano', 'Cappuccino', 'Latte', 'Hot Chocolate', 'Green Tea'])
    ]

    for b_name, b_loc in branches_data:
        branch, _ = Branch.objects.get_or_create(name=b_name, defaults={'location': b_loc})
        
        # Floors & Tables
        for f_num in [1, 2]:
            Floor.objects.get_or_create(name=f"Floor {f_num} - {b_name}", branch=branch, defaults={'table_count': 10})

        # Kitchens
        kitchen_types = []
        for kname in kitchen_names:
            kt, _ = Kitchentype.objects.get_or_create(name=f"{kname} ({b_name})", branch=branch)
            kitchen_types.append(kt)
        
        # Products
        for i, (cat_name, prod_list) in enumerate(category_data):
            cat, _ = ProductCategory.objects.get_or_create(name=cat_name, branch=branch, kitchentype=kitchen_types[i % len(kitchen_types)])
            for p_name in prod_list:
                Product.objects.create(name=p_name, branch=branch, category=cat, cost_price=50, selling_price=150, product_quantity=100)

        # Staff (Global naming: manager1, waiter1...)
        b_idx = branches_data.index((b_name, b_loc))
        for set_num in [1, 2]:
            idx = (b_idx * 2) + set_num
            roles = [('manager', 'BRANCH_MANAGER'), ('waiter', 'WAITER'), ('counter', 'COUNTER'), ('kitchen', 'KITCHEN')]
            for prefix, r_type in roles:
                user = User.objects.create(username=f"{prefix}{idx}", user_type=r_type, branch=branch, full_name=f"{prefix.capitalize()} {idx}")
                user.set_password('pass123')
                if r_type == 'KITCHEN': user.kitchentype = kitchen_types[0]
                user.save()
    print('✅ Realistic dummy data seeded')
except Exception as e:
    print(f'⚠️ Seeding Error: {e}')
EOF

    # 5. Start Server
    nohup python3 manage.py runserver 0.0.0.0:8000 > /tmp/django.log 2>&1 &
    echo "✅ Django running on http://127.0.0.1:8000"
    popd >/dev/null
}

start_node() {
    local FRONTEND_DIR=""
    [ -d "Frontend" ] && FRONTEND_DIR="Frontend" || [ -d "frontend" ] && FRONTEND_DIR="frontend"
    
    if [ -z "$FRONTEND_DIR" ]; then
        echo "❌ Node project not found!"
        return 1
    fi

    echo "🚀 Resetting & Starting Node frontend..."
    kill_node
    
    pushd "$FRONTEND_DIR" >/dev/null
    
    # Optional Deep Reset (Uncomment if needed)
    # [ -d "node_modules" ] && rm -rf node_modules
    
    [ ! -d "node_modules" ] && { echo "📦 Installing deps..."; npm install; }
    
    export NODE_OPTIONS="--max-old-space-size=4096"
    nohup npm run dev -- --host 0.0.0.0 --port 8080 > /tmp/node.log 2>&1 &
    
    echo "✅ Frontend running on http://localhost:8080"
    popd >/dev/null
}

# -------- Interactive Choice Logic --------
if [ "$1" = "--auto" ]; then
    CH=3
else
    echo ""
    echo "🔄 AmaBakery POS Reset Utility"
    echo "------------------------------"
    echo "1) Reset Backend (Wipe DB, Reseed Data)"
    echo "2) Reset Frontend (Clean Restart)"
    echo "3) Reset Both (Full System Refresh)"
    echo ""
    read -r -p "Enter choice [1-3]: " CH
fi

case "$CH" in
    1) start_django ;;
    2) start_node ;;
    3) start_django; sleep 1; start_node ;;
    *) echo "❌ Invalid choice!" ;;
esac

echo ""
echo "✅ Operational Status:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://127.0.0.1:8000"
echo "   Admin:    http://127.0.0.1:8000/admin (su/su)"
RESET_EOF

chmod +x reset.sh
echo "✅ Created reset.sh"

echo ""
echo "🚀 Finishing installation (Auto-setup)..."
./reset.sh --auto

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo "Use ./start.sh to run without resetting."
echo "Use ./reset.sh to wipe and start fresh."
echo ""
