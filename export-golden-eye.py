"""Normalize Seras's supplied Millinuim Eye for the Golden Eye offering."""
import os
import bpy
from mathutils import Vector

workspace = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(workspace, 'src/millinuim_eye.glb'))
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
points = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (low + high) / 2
scale = 0.56 / max(high - low)
for obj in meshes:
    matrix = obj.matrix_world.copy()
    obj.parent = None
    for vertex in obj.data.vertices:
        vertex.co = (matrix @ vertex.co - Vector((center.x, center.y, low.z))) * scale
    obj.matrix_world.identity()
    obj.select_set(True)
for image in bpy.data.images:
    if image.size[0] > 512 or image.size[1] > 512:
        factor = 512 / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
    if image.pixels:
        image.pack()
output = os.path.join(workspace, 'public/models/golden-eye')
os.makedirs(output, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(output, 'golden-eye.glb'), export_format='GLB',
    use_selection=True, export_yup=True, export_animations=False, export_cameras=False, export_lights=False)
print('GOLDEN_EYE', tuple((high-low)*scale), 'triangles', sum(len(o.data.polygons) for o in meshes))

# Optional review image lives outside the repository.
if os.environ.get('GOLDEN_EYE_PREVIEW'):
    scene=bpy.context.scene
    bpy.ops.object.camera_add(location=(0,-1.2,0.55))
    camera=bpy.context.object
    camera.rotation_euler=(Vector((0,0,0.22))-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=camera
    for position,energy in [((0,-1,1.5),100),((1,0,1),60)]:
        bpy.ops.object.light_add(type='AREA',location=position)
        bpy.context.object.data.energy=energy
        bpy.context.object.data.size=2
    scene.world=bpy.data.worlds.new('Review world')
    scene.world.color=(0.15,0.15,0.15)
    scene.render.engine='CYCLES';scene.cycles.samples=12
    scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
    scene.render.filepath=os.environ['GOLDEN_EYE_PREVIEW']
    bpy.ops.render.render(write_still=True)
