using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MnChemical.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHrAttendanceLeave : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "Employees",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Schedule",
                table: "Employees",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsAbsent",
                table: "AttendanceRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsManualOverride",
                table: "AttendanceRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMissingClockOut",
                table: "AttendanceRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ManagerComment",
                table: "AttendanceRecords",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LeaveRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewComment = table.Column<string>(type: "text", nullable: true),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_Date",
                table: "AttendanceRecords",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId_StartDate",
                table: "LeaveRequests",
                columns: new[] { "EmployeeId", "StartDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeaveRequests");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_Date",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "Schedule",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "IsAbsent",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "IsManualOverride",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "IsMissingClockOut",
                table: "AttendanceRecords");

            migrationBuilder.DropColumn(
                name: "ManagerComment",
                table: "AttendanceRecords");
        }
    }
}
