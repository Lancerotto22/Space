import { Logger } from "@iotinga/ts-backpack-common"
import { Card, Flex, Grid, List, ListItem, Text, Title } from "@tremor/react"
import { Link, useNavigate } from "react-router-dom"

import axios from "axios"
import useSWR from "swr"
import { CustomersApiResponse } from "types/api"

const logger = new Logger("App")

function App() {
  const {
    data: customers,
    isLoading,
    error,
  } = useSWR("/customers", async () => {
    const response = await axios.get<CustomersApiResponse>("http://localhost:8000/space/api/v1/customers", {
      withCredentials: true,
    })
    console.log(" response ", response.data)
    return response.data
  })

  const navigate = useNavigate()

  if (isLoading) {
    logger.info("Loading fetch data...")
    return null
  }

  if (customers === undefined) {
    navigate("/not-found")
    return null
  }

  return (
    <Grid numItemsMd={3} className="gap-6">
      {customers.map(customer => (
        <Link to={`/deliverables/${customer.name}`} key={customer.id}>
          <Card className="w-full hover:ring transition transition-all">
            <Title>{customer.name}</Title>
            <List className="mt-4">
              <ListItem>
                <Flex>
                  <Text>Projects</Text>
                  <Text>{customer.number_of_projects}</Text>
                </Flex>
              </ListItem>
            </List>
          </Card>
        </Link>
      ))}
    </Grid>
  )
}

export default App
