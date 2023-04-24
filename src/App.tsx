import { useState, useEffect } from 'react'
import RunnerComponent from './components/Runner';



export default function App(): JSX.Element {
  const URL = 'http://localhost'
  const [user, setUser] = useState<Runner | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [token, setToken] = useState<string>('');
  const [inputs, setInputs] = useState<Pick<Team, 'name' | 'location' | 'contactEmail'> & Pick<Runner, 'firstName' | 'lastName' | 'speed'>>({ name: '', contactEmail: '', firstName: '', lastName: '', location: '', speed: '' });

  const logout = () => {
    setUser(null)
    setTeam(null)
    setRunners([])
    localStorage.removeItem('token')
  }

  const deleteTeam = async() => {
    if(!user || !team) return
    const { success }: Awaited<Promise<{ success: boolean }>> = await (await fetch(URL + `/teams/${team.id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: user.token.toString()
      }
    })).json()
    if(success) logout()
  }

  const saveTeam = async() => {
    if(!user || !team) return
    const saved: Awaited<Promise<Team>> = await (await fetch(URL + `/teams/${team.id}`, {
      method: 'PUT',
      headers: {
        Authorization: user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: inputs.name,
        location: inputs.location,
        contactEmail: inputs.contactEmail
      })
    })).json()
    if(!('id' in saved)) console.error('error saving team')
  }

  const login: (token: string) => Promise<void> = async(token) => {
    const data: Awaited<Promise<{ status: string, user: Runner, team: Team, runners: Runner[] }>> = await (await fetch(URL + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })).json()
    if(!('user' in data)) return
    data.team = await (await fetch(URL + `/teams/${data.user.teamId}`, {
      headers: {
        Authorization: data.user.token.toString()
      }
    })).json()

    data.runners = await (await fetch(URL + `/teams/${data.user.teamId}/runners`, {
      headers: {
        Authorization: data.user.token.toString()
      }
    })).json()

    setUser(data.user)
    setTeam(data.team)
    setRunners(data.runners)
    setInputs(prev => ({ ...prev, name: data.team.name, location: data.team.location, contactEmail: data.team.contactEmail }))
    localStorage.setItem('token', data.user.token)
  }


  useEffect(() => {
    const fetchData = async() => {
      const _token = localStorage.getItem('token')
      await login(_token ? _token : token)
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return <>
    <div className='w-screen h-screen relative flexer'>
      {user ? <>
        <div className='w-[95%] h-[95%] border-2 flexer'>
          <div className='w-[95%] h-[95%] flex flex-col'>
            <div className='w-full h-1/2 border-b-2'>
              <h1 className='text-2xl font-semibold mb-5'>Manage your team</h1>
              <div className='w-72 h-80 flex flex-col justify-evenly items-center'>
                <input className='w-full h-8 border-2' placeholder='Team name' type="text" value={inputs.name} onChange={e => setInputs(prev => ({ ...prev, name: e.target.value }))} />
                <input className='w-full h-8 border-2' placeholder='Location' type="text" value={inputs.location} onChange={e => setInputs(prev => ({ ...prev, location: e.target.value }))} />
                <input className='w-full h-8 border-2' placeholder='Contact Email' type="text" value={inputs.contactEmail} onChange={e => setInputs(prev => ({ ...prev, contactEmail: e.target.value }))} />
                <div className='w-full h-12 flex justify-end gap-3'>
                  <button className='w-24 h-8 border-2 border-red-600 bg-red-400' onClick={deleteTeam}>Delete team</button>
                  <button className='w-16 h-8 border-2 border-gray-600 bg-gray-400' onClick={saveTeam}>Save</button>
                </div>
              </div>
            </div>
            <div className='w-full h-1/2'>
              <div className='w-full h-16 flex justify-between items-center'>
                <h1 className='text-2xl font-semibold'>Runners</h1>
                <button className='w-16 h-8 border-2 border-gray-600 bg-gray-400' onClick={logout}>Logout</button>
              </div>
              <div className='w-full h-72 border-2'>
                <div className='w-full h-8 flex items-center'>
                  <span className='w-[22.5%] h-8 flexer border-r-2'>First Name</span>
                  <span className='w-[22.5%] h-8 flexer border-r-2'>Last Name</span>
                  <span className='w-[22.5%] h-8 flexer border-r-2'>Speed</span>
                  <span className='w-[22.5%] h-8 flexer border-r-2'>Token</span>
                  <span className='w-[10%] h-8 flexer'>Actions</span>
                </div>
                {runners.map(i => <>
                  <RunnerComponent runner={i} token={user.token}  remove={() => {
                    setRunners(prev => prev.filter(r => r.token !== i.token))
                  }} />
                </>)}
              </div>
            </div>
          </div>
        </div>
      </>: <>
        <div className='w-[35rem] h-96 flex flex-col border-2'>
          <div className='flex flex-col w-full h-1/2'>
            <h1 className='w-full h-1/2 flexer text-2xl font-bold'>Login</h1>
            <h2 className='w-full h-1/2 flexer text-xl'>Login using your token</h2>
          </div>
          <div className='w-full h-1/2 flex flex-col'>
            <div className='w-full h-1/2 flexer'>
              <input
                className='border-2 w-56 h-8 text-center'
                placeholder='Token'
                type="text" maxLength={9} value={token} onChange={e => {
                setToken(e.target.value)
              }} />
            </div>
            <div className='w-full h-1/2 flexer'>
              <button className='w-24 h-8 border-2 border-gray-600 bg-gray-400' onClick={() => login(token)} type='button'>Login</button>
            </div>
          </div>
        </div>
      </>}
    </div>
  </>
}