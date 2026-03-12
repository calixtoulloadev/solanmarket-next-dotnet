namespace Solanmarket.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetAsync(string email, string token, CancellationToken ct = default);
    Task SendOrderConfirmationAsync(string email, string orderNumber, CancellationToken ct = default);
    Task SendWelcomeAsync(string email, string firstName, CancellationToken ct = default);
}
