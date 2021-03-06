import { useState, useContext, useEffect, Fragment } from "react"
import { GlobalContext } from "../GlobalContext"

export function Friends() {
  const { setFriendsPage, search, currentUser } = useContext(GlobalContext)
  const [pending, setPending] = useState([])
  const [allUsers, setAllUsers] = useState([])

  function pendingDispatch(obj) {
    if (pending?.length) {
      setPending([...pending, obj])
    } else {
      setPending([obj])
    }
  }

  useEffect(() => {
    fetch(`https://q1weuz.deta.dev/friends/page/${currentUser.key}`)
      .then(data => data.json())
      .then(data => {
        setPending(data.pending)
        setAllUsers(data.users.value)
        return
      })
  }, [currentUser])

  return (
    <div style={{textAlign: "center", position: "relative"}}>
      {
        allUsers?.length ? 
          <Fragment>
            <button onClick={() => setFriendsPage(false)} className="friends-back-btn">{`Back`}</button>
            <div className="flex" style={{justifyContent: "space-between", width: "77%", margin: "0 auto"}}>
              <h2>Friends</h2>
              <h2>All Users</h2>
              <h2>Requests</h2>
            </div>
          </Fragment>
        : 
          null 
      }
      <div className="friends-container" style={{ width: "auto"}}>
        {
          !allUsers?.length ?
            <h2 style={{marginTop: "50px"}}>Fetching users and pending requests...</h2>
          :  
            <div className="flex" style={{flexWrap: "nowrap"}}>
              <div style={{marginRight: "10px"}}>
                {currentUser.friends.map((elem, index) => (
                    <Friend
                      key={index}
                      name={elem}
                      isFriend={true}
                    />
                  ))
                }
              </div>
              <div style={{overflowY: "scroll", width: '340px', marginRight: '10px'}}>
                {
                  allUsers.filter(user => {
                    if (
                        (!search || (search && user.toLowerCase().startsWith(search.toLowerCase()))) 
                        && user.toLowerCase() !== currentUser.key.toLowerCase() 
                        && !pending?.find(elem => 
                          (elem.to.toLowerCase() === user.toLowerCase() || elem.from.toLowerCase() === user.toLowerCase())
                        )
                        && !currentUser?.friends.find(elem => 
                          elem.toLowerCase() === user.toLowerCase()
                        )
                      ) {
                      return user
                    }
                    return false
                  }).map((user, index) => (
                    <Friend 
                      key={index}
                      name={user}
                      pendingDispatch={pendingDispatch}
                    />
                  ))
                }
              </div>
              <div>
                {
                  pending?.length ? 
                  pending.map((elem, index) => (
                    <Friend 
                      key={index}
                      id={elem.key}
                      acceptable={elem.to === currentUser.key}
                      name={elem.to === currentUser.key ? elem.from : elem.to}
                      pending={true}
                    />
                  ))
                  : 
                  <h3>No Pending Requests</h3>
                }
              </div>
            </div>
        }
      </div>
    </div>
  )
}

function Friend({ name, pending, acceptable, id, isFriend, pendingDispatch }) {
  const { currentUser, setCurrentUser } = useContext(GlobalContext)
  const [isLoading, setIsLoading] = useState(false)

  function sendFriendReq() {
    setIsLoading(true)
    fetch(`https://q1weuz.deta.dev/friends/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "from": currentUser.key,
        "to": name, 
      })
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.result) {
          pendingDispatch(data.result)
          setIsLoading(false)
          return
        }
        alert("Please try again")
      })
  }

  function acceptFriendReq() {
    setIsLoading(true)
    fetch(`https://q1weuz.deta.dev/friends/accept/${id}/${currentUser.key}/${currentUser.version}`, { method: "PUT"})
      .then(data => data.json())
      .then(data => { 
        if (data.result) {
          setCurrentUser(data.result)
          setIsLoading(false)
          return
        }
        alert("Please try again")
      })
  }

  return (
    <div className="friends-item-container">
      <h3>{name}</h3>
      {
        isLoading ?
          <h3>loading...</h3>
        : pending && !acceptable ? 
          <h3>Pending</h3>
        : pending && acceptable ?
          <button onClick={() => acceptFriendReq()}className="add-friend">Accept</button>
        : !isFriend ?
          <button onClick={() => sendFriendReq()} className="add-friend">Add Friend</button>
        : 
          null
      }
    </div>
  )
}