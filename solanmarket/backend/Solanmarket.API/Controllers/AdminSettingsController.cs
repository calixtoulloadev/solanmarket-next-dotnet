using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "Admin")]
public class AdminSettingsController : ControllerBase
{
    private static readonly object DefaultSettings = new
    {
        storeName = "Solanmarket",
        storeDescription = "",
        contactEmail = "",
        address = "",
        currency = "USD",
        freeShippingThreshold = 50,
        notifyNewOrder = true,
        notifyLowStock = true,
        notifyNewUser = false,
    };

    [HttpGet]
    public IActionResult GetSettings() => Ok(DefaultSettings);

    [HttpPut]
    public IActionResult SaveSettings([FromBody] object settings) => Ok(settings);
}
