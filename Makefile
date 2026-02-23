.PHONY: install db db-stop dev stop stop-studio panic studio logs gateway auth cinema booking movie generate migrate migrate-deploy seed setup

LOGS_DIR := .logs
PIDS_FILE := .pids
STUDIO_PORT_AUTH    := 5555
STUDIO_PORT_CINEMA  := 5556
STUDIO_PORT_BOOKING := 5557

# ─── Dependencies ────────────────────────────────────────────────────────────

install:
	cd api-gateway     && npm install
	cd auth-service    && npm install
	cd cinema-service  && npm install
	cd booking-service && npm install
	cd movie-service   && npm install

# ─── Prisma ──────────────────────────────────────────────────────────────────

generate:
	cd auth-service    && npx prisma generate
	cd cinema-service  && npx prisma generate
	cd booking-service && npx prisma generate

migrate:
	cd auth-service    && npx prisma migrate dev --name init
	cd cinema-service  && npx prisma migrate dev --name init
	cd booking-service && npx prisma migrate dev --name init

migrate-deploy:
	cd auth-service    && npx prisma migrate deploy
	cd cinema-service  && npx prisma migrate deploy
	cd booking-service && npx prisma migrate deploy

seed:
	cd cinema-service  && npx prisma db seed

setup: generate migrate

# ─── Databases ───────────────────────────────────────────────────────────────

db:
	docker compose up -d

db-stop:
	docker compose down

# ─── Services (dev) ──────────────────────────────────────────────────────────

dev:
	@mkdir -p $(LOGS_DIR)
	@rm -f $(PIDS_FILE)
	@(cd api-gateway     && npm run start:dev > ../$(LOGS_DIR)/gateway.log  2>&1) & echo "gateway:$$!" >> $(PIDS_FILE)
	@(cd auth-service    && npm run start:dev > ../$(LOGS_DIR)/auth.log     2>&1) & echo "auth:$$!"    >> $(PIDS_FILE)
	@(cd cinema-service  && npm run start:dev > ../$(LOGS_DIR)/cinema.log   2>&1) & echo "cinema:$$!"  >> $(PIDS_FILE)
	@(cd booking-service && npm run start:dev > ../$(LOGS_DIR)/booking.log  2>&1) & echo "booking:$$!" >> $(PIDS_FILE)
	@(cd movie-service   && npm run start:dev > ../$(LOGS_DIR)/movie.log    2>&1) & echo "movie:$$!"   >> $(PIDS_FILE)
	@echo "Services started. Run 'make logs' to follow output."

gateway:
	cd api-gateway && npm run start:dev 2>&1 | tee ../$(LOGS_DIR)/gateway.log

auth:
	cd auth-service && npm run start:dev 2>&1 | tee ../$(LOGS_DIR)/auth.log

cinema:
	cd cinema-service && npm run start:dev 2>&1 | tee ../$(LOGS_DIR)/cinema.log

booking:
	cd booking-service && npm run start:dev 2>&1 | tee ../$(LOGS_DIR)/booking.log

movie:
	cd movie-service && npm run start:dev 2>&1 | tee ../$(LOGS_DIR)/movie.log

stop:
	@[ -f $(PIDS_FILE) ] || { echo "No .pids file found."; exit 0; }
	@while IFS=: read -r name pid; do \
		if kill -0 $$pid 2>/dev/null; then \
			kill -- -$$(ps -o pgid= -p $$pid | tr -d ' ') 2>/dev/null || kill $$pid 2>/dev/null; \
			echo "Stopped $$name (PID $$pid)"; \
		fi; \
	done < $(PIDS_FILE)
	@rm -f $(PIDS_FILE)
	@echo "All services stopped."

# ─── Prisma Studio ───────────────────────────────────────────────────────────

studio:
	@mkdir -p $(LOGS_DIR)
	@(cd auth-service    && npx prisma studio --port $(STUDIO_PORT_AUTH)    > ../$(LOGS_DIR)/studio-auth.log    2>&1) &
	@(cd cinema-service  && npx prisma studio --port $(STUDIO_PORT_CINEMA)  > ../$(LOGS_DIR)/studio-cinema.log  2>&1) &
	@(cd booking-service && npx prisma studio --port $(STUDIO_PORT_BOOKING) > ../$(LOGS_DIR)/studio-booking.log 2>&1) &
	@echo "Prisma Studio running on ports $(STUDIO_PORT_AUTH) (auth), $(STUDIO_PORT_CINEMA) (cinema), $(STUDIO_PORT_BOOKING) (booking)."

stop-studio:
	@fuser -k $(STUDIO_PORT_AUTH)/tcp    2>/dev/null || true
	@fuser -k $(STUDIO_PORT_CINEMA)/tcp  2>/dev/null || true
	@fuser -k $(STUDIO_PORT_BOOKING)/tcp 2>/dev/null || true
	@echo "Prisma Studio stopped."

# ─── Panic ───────────────────────────────────────────────────────────────────

panic:
	@pkill -f "nest" || true
	@pkill -f "node --enable-source-maps" || true
	@fuser -k $(STUDIO_PORT_AUTH)/tcp    2>/dev/null || true
	@fuser -k $(STUDIO_PORT_CINEMA)/tcp  2>/dev/null || true
	@fuser -k $(STUDIO_PORT_BOOKING)/tcp 2>/dev/null || true
	@rm -f $(PIDS_FILE)
	@echo "All processes killed."

# ─── Logs ────────────────────────────────────────────────────────────────────

logs:
	tail -f $(LOGS_DIR)/*.log