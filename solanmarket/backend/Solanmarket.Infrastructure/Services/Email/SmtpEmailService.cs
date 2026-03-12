using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Solanmarket.Application.Interfaces;

namespace Solanmarket.Infrastructure.Services.Email;

public class SmtpEmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly bool _useTls;
    private readonly string _user;
    private readonly string _password;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly string _frontendBaseUrl;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _logger = logger;
        var section = config.GetSection("Smtp");
        _host = section["Host"] ?? "smtp.gmail.com";
        _port = int.TryParse(section["Port"], out var p) ? p : 587;
        _useTls = bool.TryParse(section["UseTls"], out var tls) ? tls : true;
        _user = section["User"] ?? throw new InvalidOperationException("Smtp:User is not configured.");
        _password = section["Password"] ?? throw new InvalidOperationException("Smtp:Password is not configured.");
        _fromEmail = section["FromEmail"] ?? _user;
        _fromName = section["FromName"] ?? "Solanmarket";
        _frontendBaseUrl = config["FrontendBaseUrl"] ?? "http://localhost:3000";

        _logger.LogInformation("SmtpEmailService configured for {Host}:{Port} UseTls={UseTls} From={FromEmail}", _host, _port, _useTls, _fromEmail);
    }

    private SmtpClient CreateClient() => new(_host, _port)
    {
        Credentials = new NetworkCredential(_user, _password),
        EnableSsl = _useTls,
    };

    private MailMessage CreateMessage(string to, string subject, string htmlBody)
    {
        var msg = new MailMessage
        {
            From = new MailAddress(_fromEmail, _fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        msg.To.Add(to);
        return msg;
    }

    public async Task SendPasswordResetAsync(string email, string token, CancellationToken ct = default)
    {
        var encodedToken = Uri.EscapeDataString(token);
        var encodedEmail = Uri.EscapeDataString(email);
        var resetLink = $"{_frontendBaseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

        using var client = CreateClient();
        using var msg = CreateMessage(
            email,
            "Reset your Solanmarket password",
            $"""
            <p>You requested a password reset for your Solanmarket account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align:center;margin:24px 0">
                <a href="{resetLink}" style="display:inline-block;padding:14px 32px;background:#2d2d2d;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px">
                    Reset Password
                </a>
            </p>
            <p style="font-size:12px;color:#888">Or copy and paste this link in your browser:</p>
            <p style="font-size:12px;word-break:break-all;color:#555">{resetLink}</p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """);
        try
        {
            _logger.LogInformation("SmtpEmailService: sending password reset to {Email} via {Host}:{Port}", email, _host, _port);
            await client.SendMailAsync(msg, ct);
            _logger.LogInformation("SmtpEmailService: SMTP accepted message for {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SmtpEmailService: failed to send password reset to {Email}", email);
            throw;
        }
    }

    public async Task SendOrderConfirmationAsync(string email, string orderNumber, CancellationToken ct = default)
    {
        using var client = CreateClient();
        using var msg = CreateMessage(
            email,
            $"Your order {orderNumber} is confirmed — Solanmarket",
            $"""
            <p>Hi there!</p>
            <p>Your order <strong>{orderNumber}</strong> has been confirmed.</p>
            <p>Thank you for shopping at Solanmarket!</p>
            """);
        try
        {
            _logger.LogInformation("SmtpEmailService: sending order confirmation to {Email} order {Order}", email, orderNumber);
            await client.SendMailAsync(msg, ct);
            _logger.LogInformation("SmtpEmailService: SMTP accepted order confirmation for {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SmtpEmailService: failed to send order confirmation to {Email}", email);
            throw;
        }
    }

    public async Task SendWelcomeAsync(string email, string firstName, CancellationToken ct = default)
    {
        using var client = CreateClient();
        using var msg = CreateMessage(
            email,
            "Welcome to Solanmarket!",
            $"""
            <p>Hi {firstName},</p>
            <p>Your Solanmarket account has been created. Welcome to the community!</p>
            <p>Start exploring local products and support farmers near you.</p>
            """);
        try
        {
            _logger.LogInformation("SmtpEmailService: sending welcome email to {Email}", email);
            await client.SendMailAsync(msg, ct);
            _logger.LogInformation("SmtpEmailService: SMTP accepted welcome email for {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SmtpEmailService: failed to send welcome email to {Email}", email);
            throw;
        }
    }
}
