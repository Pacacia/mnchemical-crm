using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MnChemical.Application.Services;
using MnChemical.Infrastructure.Data;
using MnChemical.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "MnChemicalCrmSuperSecretKey12345678";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "MnChemicalCrm",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "MnChemicalCrm",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetValue<string>("FrontendUrl") ?? "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    var warehouse = scope.ServiceProvider.GetRequiredService<IWarehouseService>();
    await warehouse.SeedReferenceMaterialsAsync();
    var auth = scope.ServiceProvider.GetRequiredService<IAuthService>();
    await auth.SeedAdminAsync();
}

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    // Bypass auth in development — all requests treated as authenticated Admin
    app.Use(async (context, next) =>
    {
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            var claims = new[]
            {
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, Guid.Empty.ToString()),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "dev"),
                new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "Admin"),
                new System.Security.Claims.Claim("fullName", "Developer"),
            };
            context.User = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(claims, "DevBypass"));
        }
        await next();
    });
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
