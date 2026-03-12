using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Solanmarket.Application.Features.Profile;

namespace Solanmarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController(IMediator mediator) : ControllerBase
{
    /// <summary>Get the current user's profile.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await mediator.Send(new GetProfileQuery(), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : Unauthorized(result.Error);

        return Ok(result.Value);
    }

    /// <summary>Update the current user's profile.</summary>
    [HttpPut]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new UpdateProfileCommand(request), ct);
        if (!result.IsSuccess)
            return result.StatusCode == 404 ? NotFound(result.Error) : Unauthorized(result.Error);

        return Ok(result.Value);
    }
}
