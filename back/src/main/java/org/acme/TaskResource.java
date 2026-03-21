package org.acme;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskResource {

    @GET
    public List<Task> getAll() {
        return Task.listAll();
    }

    @POST
    @Transactional
    public Response add(Task task) {

        System.out.println("RECEIVED: " + task.title);

        Task.persist(task);

        return Response.ok(task).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {

        Task.deleteById(id);

        return Response.ok().build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, Task updatedTask) {

        Task task = Task.findById(id);

        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        task.title = updatedTask.title;
        task.description = updatedTask.description;

        return Response.ok(task).build();
    }

}