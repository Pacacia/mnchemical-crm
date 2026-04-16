FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY MnChemical.Domain/MnChemical.Domain.csproj MnChemical.Domain/
COPY MnChemical.Application/MnChemical.Application.csproj MnChemical.Application/
COPY MnChemical.Infrastructure/MnChemical.Infrastructure.csproj MnChemical.Infrastructure/
COPY MnChemical.WebApi/MnChemical.WebApi.csproj MnChemical.WebApi/
RUN dotnet restore MnChemical.WebApi/MnChemical.WebApi.csproj

COPY . .
RUN dotnet publish MnChemical.WebApi/MnChemical.WebApi.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Development
ENTRYPOINT ["dotnet", "MnChemical.WebApi.dll"]
