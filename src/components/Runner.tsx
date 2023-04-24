import { useState } from 'react'

type Props = {
	runner: Runner
	token: string
	remove: () => void
}

export default (function Runner({ runner, token, remove }) {
	const URL = 'http://localhost'
	const [inputs, setInputs] = useState<Pick<Runner, 'firstName' | 'lastName' | 'speed'>>({ firstName: runner.firstName, lastName: runner.lastName, speed: runner.speed });

	const deleteRunner = async() => {
		const res: Awaited<Promise<{ success: boolean }>> = await (await fetch(URL + `/teams/${runner.teamId}/runners/${runner.id}`, {
			method: 'DELETE',
			headers: {
				Authorization: token
			}
		})).json()
		if(res.success) remove()
	}

	const saveRunner = async() => {
		const res: Awaited<Promise<Team>> = await (await fetch(URL + `/teams/${runner.teamId}/runners/${runner.id}`, {
			method: 'PUT',
			headers: {
				Authorization: token,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				firstName: inputs.firstName,
				lastName: inputs.lastName,
				speed: inputs.speed
			})
		})).json()
		if('name' in res) console.log('success')
	}

	return <>
	<div className='w-full h-8 flex items-center'>
		<input className='w-[22.5%] h-8 flexer border-r-2 text-center' value={inputs.firstName} onChange={e => setInputs(prev => ({ ...prev, firstName: e.target.value }))} />
		<input className='w-[22.5%] h-8 flexer border-r-2 text-center' value={inputs.lastName} onChange={e => setInputs(prev => ({ ...prev, lastName: e.target.value }))} />
		<input className='w-[22.5%] h-8 flexer border-r-2 text-center' value={inputs.speed} onChange={e => setInputs(prev => ({ ...prev, speed: e.target.value }))} />
		<span className='w-[22.5%] h-8 flexer border-r-2'>{runner.token}</span>
		<div className='w-[10%] h-8 flex justify-evenly'>
			<button onClick={() => navigator.clipboard.writeText(runner.token)}>C</button>
			<button onClick={saveRunner}>S</button>
			<button onClick={deleteRunner}>D</button>
		</div>
	</div>
	</>
}) as React.FC<Props>