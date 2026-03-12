using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using Solanmarket.Application.Interfaces;

namespace Solanmarket.Infrastructure.Services.Email;

public class SendGridEmailService : IEmailService
{
    private readonly ISendGridClient _client;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public SendGridEmailService(IConfiguration config)
    {
        var section = config.GetSection("SendGrid");
        _client = new SendGridClient(section["ApiKey"]);
        _fromEmail = section["FromEmail"] ?? "noreply@solanmarket.com";
        _fromName = section["FromName"] ?? "Solanmarket";
    }

    public async Task SendPasswordResetAsync(string email, string token, CancellationToken ct = default)
    {
        var msg = MailHelper.CreateSingleEmail(
            new EmailAddress(_fromEmail, _fromName),
            new EmailAddress(email),
            "Reset your Solanmarket password",
            $"Use this token to reset your password: {token}",
            $"<p>Use the following token to reset your password:</p><p><strong>{token}</strong></p>");
        await _client.SendEmailAsync(msg, ct);
    }

    public async Task SendOrderConfirmationAsync(string email, string orderNumber, CancellationToken ct = default)
    {
        var msg = MailHelper.CreateSingleEmail(
            new EmailAddress(_fromEmail, _fromName),
            new EmailAddress(email),
            $"Your order {orderNumber} is confirmed",
            $"Your order {orderNumber} has been confirmed. Thank you for shopping at Solanmarket!",
            $"<p>Your order <strong>{orderNumber}</strong> has been confirmed. Thank you for shopping at Solanmarket!</p>");
        await _client.SendEmailAsync(msg, ct);
    }

    public async Task SendWelcomeAsync(string email, string firstName, CancellationToken ct = default)
    {
        var msg = MailHelper.CreateSingleEmail(
            new EmailAddress(_fromEmail, _fromName),
            new EmailAddress(email),
            "Welcome to Solanmarket!",
            $"Welcome, {firstName}! Your account has been created.",
            $"<p>Welcome, <strong>{firstName}</strong>! Your Solanmarket account is ready. Start exploring our catalog.</p>");
        await _client.SendEmailAsync(msg, ct);
    }
}
