# ── Build stage ───────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution + project files first for layer caching
COPY Solanmarket.slnx ./
COPY Solanmarket.Domain/Solanmarket.Domain.csproj         Solanmarket.Domain/
COPY Solanmarket.Application/Solanmarket.Application.csproj Solanmarket.Application/
COPY Solanmarket.Infrastructure/Solanmarket.Infrastructure.csproj Solanmarket.Infrastructure/
COPY Solanmarket.API/Solanmarket.API.csproj               Solanmarket.API/
COPY Solanmarket.Tests/Solanmarket.Tests.csproj           Solanmarket.Tests/

RUN dotnet restore Solanmarket.API/Solanmarket.API.csproj

# Copy everything else and publish
COPY . .
RUN dotnet restore Solanmarket.API/Solanmarket.API.csproj
RUN dotnet publish Solanmarket.API/Solanmarket.API.csproj \
    -c Release \
    -o /app/publish

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

EXPOSE 5000
ENTRYPOINT ["dotnet", "Solanmarket.API.dll"]
