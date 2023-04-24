export {};

declare global {
	type Runner = {
		id: number
		teamId: number
		firstName: string
		lastName: string
		speed: string
		token: string
	}

	type Team = {
		id: number
		name: string
		location: string
		contactEmail: string
	}
}