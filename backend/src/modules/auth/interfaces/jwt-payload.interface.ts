/**
 * Payload that goes inside the JWT access token.
 *
 * NOTE about `workspaceId`: for now we assume one "active" workspace per
 * user (the one created upon registration). When we support multiple
 * workspaces per user (inviting members to a team, belonging to
 * several studios, etc.), we will add a POST /auth/switch-workspace endpoint
 * that re-issues the token with a different workspaceId, validating that the
 * user is a member of that workspace.
 */
export interface JwtPayload {
	sub: string; // userId
	email: string;
	workspaceId: string;
	role: 'OWNER' | 'ADMIN' | 'MEMBER';
}
